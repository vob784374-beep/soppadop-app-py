import os
import json
import subprocess
from flask import Blueprint, request, jsonify, current_app
from src.api.utils.decorators import owner_required
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()
test_bp = Blueprint("test", __name__, url_prefix="/api")


@test_bp.route("/test-report", methods=["GET"])
@owner_required
def get_test_report():
    report_path = os.path.join(
        current_app.root_path, "..", "tests", "reports", "test_report.json"
    )
    if os.path.exists(report_path):
        with open(report_path) as f:
            return jsonify(json.load(f))
    return jsonify({"error": "No report found"}), 404


@test_bp.route("/run-tests", methods=["POST"])
@owner_required
def run_tests():
    try:
        data = request.get_json(silent=True) or {}
        mode = data.get("mode", "all")

        app_dir = os.path.join(current_app.root_path, "..")

        pytest_args = [
            "python",
            "-m",
            "pytest",
            "--tb=short",
            "-v",
            "--junitxml=tests/reports/junit.xml",
            "--cov-report=json:tests/reports/coverage.json",
        ]

        if mode == "unit":
            pytest_args.append("-m")
            pytest_args.append("unit")
        elif mode == "automation":
            pytest_args.append("-m")
            pytest_args.append("automation")

        result = subprocess.run(
            pytest_args, cwd=app_dir, capture_output=True, text=True, timeout=120
        )

        output = result.stdout + result.stderr
        passed = output.count(" PASSED")
        failed = output.count(" FAILED")
        errors = output.count(" ERROR")
        total = passed + failed + errors

        coverage_data = {}
        coverage_file = os.path.join(app_dir, "tests", "reports", "coverage.json")
        if os.path.exists(coverage_file):
            with open(coverage_file) as f:
                coverage_data = json.load(f)

        unit_suites, unit_passed, unit_total = _parse_suites(output, "unit")
        automation_suites, automation_passed, automation_total = _parse_suites(
            output, "automation"
        )

        from datetime import datetime

        report = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "summary": {
                "total": total,
                "passed": passed,
                "failed": failed,
                "errors": errors,
                "pass_rate": round(passed / total * 100, 1) if total > 0 else 0,
                "unit_total": unit_total,
                "unit_passed": unit_passed,
                "automation_total": automation_total,
                "automation_passed": automation_passed,
            },
            "coverage": {
                "total_statements": coverage_data.get("totals", {}).get(
                    "num_statements", 0
                ),
                "covered_statements": coverage_data.get("totals", {}).get(
                    "covered_lines", 0
                ),
                "coverage_percent": round(
                    coverage_data.get("totals", {}).get("percent_covered", 0), 1
                ),
            },
            "unit_suites": unit_suites,
            "automation_suites": automation_suites,
            "output": output,
        }

        report_file = os.path.join(app_dir, "tests", "reports", "test_report.json")
        os.makedirs(os.path.dirname(report_file), exist_ok=True)
        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)

        log.info(
            f"Tests run | mode={mode} | total={total} | passed={passed} | failed={failed}"
        )
        return jsonify(report)

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Tests timed out"}), 500
    except Exception as e:
        log.error(f"Test run failed | {e}")
        return jsonify({"error": str(e)}), 500


def _parse_suites(output, test_type="all"):
    suites = {}
    passed = 0
    total = 0
    for line in output.split("\n"):
        if "::" in line and ("PASSED" in line or "FAILED" in line):
            if test_type == "unit" and "automation" in line.lower():
                continue
            if test_type == "automation" and "automation" not in line.lower():
                continue
            parts = line.split("::")
            if len(parts) >= 2:
                suite = parts[0].split("/")[-1].replace("test_", "").replace(".py", "")
                status = "passed" if "PASSED" in line else "failed"
                if suite not in suites:
                    suites[suite] = {"passed": 0, "failed": 0, "tests": []}
                suites[suite][status] += 1
                suites[suite]["tests"].append(
                    {
                        "name": parts[-1].split()[0],
                        "status": status,
                    }
                )
                total += 1
                if status == "passed":
                    passed += 1
    return suites, passed, total
