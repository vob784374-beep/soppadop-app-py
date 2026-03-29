import subprocess
import json
import os
from datetime import datetime


def run_tests():
    reports_dir = "tests/reports"
    os.makedirs(reports_dir, exist_ok=True)

    result = subprocess.run(
        [
            "python",
            "-m",
            "pytest",
            "--tb=short",
            "-v",
            f"--junitxml={reports_dir}/junit.xml",
            f"--cov-report=json:{reports_dir}/coverage.json",
        ],
        capture_output=True,
        text=True,
    )

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    test_output = result.stdout + result.stderr
    passed = test_output.count(" PASSED")
    failed = test_output.count(" FAILED")
    errors = test_output.count(" ERROR")
    total = passed + failed + errors

    coverage_data = {}
    coverage_file = f"{reports_dir}/coverage.json"
    if os.path.exists(coverage_file):
        with open(coverage_file) as f:
            coverage_data = json.load(f)

    report = {
        "timestamp": timestamp,
        "summary": {
            "total": total,
            "passed": passed,
            "failed": failed,
            "errors": errors,
            "pass_rate": round(passed / total * 100, 1) if total > 0 else 0,
        },
        "coverage": {
            "total_statements": coverage_data.get("totals", {}).get(
                "num_statements", 0
            ),
            "covered_statements": coverage_data.get("totals", {}).get(
                "covered_lines", 0
            ),
            "coverage_percent": coverage_data.get("totals", {}).get(
                "percent_covered", 0
            ),
        },
        "suites": _parse_suites(test_output),
        "output": test_output,
    }

    report_file = f"{reports_dir}/test_report.json"
    with open(report_file, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"TEST REPORT - {timestamp}")
    print(f"{'=' * 60}")
    print(f"Total: {total} | Passed: {passed} | Failed: {failed} | Errors: {errors}")
    print(f"Pass Rate: {report['summary']['pass_rate']}%")
    print(f"Coverage: {report['coverage']['coverage_percent']}%")
    print(f"{'=' * 60}")

    return report


def _parse_suites(output):
    suites = {}
    for line in output.split("\n"):
        if "::" in line and ("PASSED" in line or "FAILED" in line):
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
    return suites


if __name__ == "__main__":
    run_tests()
