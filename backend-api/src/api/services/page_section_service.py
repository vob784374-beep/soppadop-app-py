from src.api.models import db, PageSection
from src.api.repositories.page_section_repository import (
    PageSectionRepository,
    SectionContentRepository,
)
from src.api.services.section_order_service import SectionOrderService
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()


class PageSectionService:
    @staticmethod
    def get_public_sections():
        sections = PageSectionRepository.find_all_visible()
        result = []
        for section in sections:
            s = section.to_dict(include_contents=True)
            result.append(s)
        return result, None

    @staticmethod
    def get_list(
        page=1, per_page=50, section_type=None, filters=None, search=None, sorts=None
    ):
        pagination = PageSectionRepository.find_all(
            page=page,
            per_page=per_page,
            section_type=section_type,
            filters=filters,
            search=search,
            sorts=sorts,
        )
        return {
            "sections": [s.to_dict_admin() for s in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }, None

    @staticmethod
    def get_by_id(section_id):
        section = PageSectionRepository.find_by_id(section_id)
        if not section:
            return None, "Section not found"
        return section, None

    @staticmethod
    def create(user_id, title, section_type="general", **kwargs):
        data = {
            "title": title,
            "section_type": section_type,
            "created_by": user_id,
        }
        for key in [
            "description",
            "cover_image",
            "sort_order",
            "is_visible",
            "status",
            "layout",
            "max_items",
            "background_color",
            "template_group",
            "group_order",
        ]:
            if key in kwargs and kwargs[key] is not None:
                data[key] = kwargs[key]

        section = PageSectionRepository.create(data)
        log.info(f"PageSectionService.create | id={section.id} | title={title}")
        return section, None

    @staticmethod
    def update(section_id, user_id, **kwargs):
        section = PageSectionRepository.find_by_id(section_id)
        if not section:
            return None, "Section not found"

        data = {}
        for key in [
            "title",
            "section_type",
            "description",
            "cover_image",
            "sort_order",
            "is_visible",
            "status",
            "layout",
            "max_items",
            "background_color",
            "section_effects",
        ]:
            if key in kwargs and kwargs[key] is not None:
                val = kwargs[key]
                if key == "section_effects" and not isinstance(val, str):
                    import json

                    val = json.dumps(val)
                data[key] = val

        updated = PageSectionRepository.update(section_id, data)
        log.info(f"PageSectionService.update | id={section_id} | by={user_id}")
        return updated, None

    @staticmethod
    def delete(section_id, user_id):
        section = PageSectionRepository.find_by_id(section_id)
        if not section:
            return None, "Section not found"

        SectionContentRepository.delete_by_section(section_id)
        PageSectionRepository.delete(section)
        log.info(f"PageSectionService.delete | id={section_id} | by={user_id}")
        return True, None

    @staticmethod
    def reorder(section_orders, user_id):
        ok, err = SectionOrderService.reorder(section_orders)
        if err:
            return None, err
        log.info(
            f"PageSectionService.reorder | count={len(section_orders)} | by={user_id}"
        )
        return True, None


class SectionContentService:
    @staticmethod
    def get_by_section(
        section_id, page=1, per_page=50, filters=None, search=None, sorts=None
    ):
        section = PageSectionRepository.find_by_id(section_id)
        if not section:
            return None, "Section not found"

        pagination = SectionContentRepository.find_by_section(
            section_id,
            page=page,
            per_page=per_page,
            filters=filters,
            search=search,
            sorts=sorts,
        )
        return {
            "section": section.to_dict(),
            "contents": [c.to_dict() for c in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }, None

    @staticmethod
    def get_by_id(content_id):
        content = SectionContentRepository.find_by_id(content_id)
        if not content:
            return None, "Content not found"
        return content, None

    @staticmethod
    def create(section_id, **kwargs):
        section = PageSectionRepository.find_by_id(section_id)
        if not section:
            return None, "Section not found"

        data = {"section_id": section_id}
        for key in [
            "title",
            "subtitle",
            "body",
            "image_url",
            "video_url",
            "link_url",
            "tags",
            "author",
            "sort_order",
            "is_visible",
            "content_date",
        ]:
            if key in kwargs and kwargs[key] is not None:
                data[key] = kwargs[key]

        content = SectionContentRepository.create(data)
        log.info(
            f"SectionContentService.create | id={content.id} | section={section_id}"
        )
        return content, None

    @staticmethod
    def update(content_id, user_id, **kwargs):
        content = SectionContentRepository.find_by_id(content_id)
        if not content:
            return None, "Content not found"

        data = {}
        for key in [
            "title",
            "subtitle",
            "body",
            "image_url",
            "video_url",
            "link_url",
            "tags",
            "author",
            "sort_order",
            "is_visible",
            "content_date",
        ]:
            if key in kwargs and kwargs[key] is not None:
                data[key] = kwargs[key]

        updated = SectionContentRepository.update(content_id, data)
        log.info(f"SectionContentService.update | id={content_id} | by={user_id}")
        return updated, None

    @staticmethod
    def delete(content_id, user_id):
        content = SectionContentRepository.find_by_id(content_id)
        if not content:
            return None, "Content not found"

        SectionContentRepository.delete(content)
        log.info(f"SectionContentService.delete | id={content_id} | by={user_id}")
        return True, None


class TemplateService:
    # ─── SECTION TEMPLATES (child) ───────────────────────
    # Content items to populate an individual section.
    # A section can contain content from multiple templates.
    SECTION_TEMPLATES = [
        {
            "id": "hero-banner",
            "type": "section",
            "name": "Hero Banner",
            "description": "Full-width hero banner with title, subtitle, and CTA",
            "section_type": "general",
            "layout": "hero",
            "contents": [
                {
                    "title": "Welcome to Our Website",
                    "subtitle": "Discover amazing content and services",
                    "body": "We provide the best solutions for your needs. Explore our features and get started today.",
                    "image_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200",
                    "link_url": "#",
                    "sort_order": 0,
                },
            ],
        },
        {
            "id": "blog-grid-3",
            "type": "section",
            "name": "Blog Grid (3 items)",
            "description": "3 blog post cards with images and excerpts",
            "section_type": "blog",
            "layout": "grid",
            "contents": [
                {
                    "title": "Getting Started Guide",
                    "subtitle": "Learn the basics",
                    "body": "A comprehensive guide to help you get started with our platform.",
                    "image_url": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600",
                    "author": "Admin",
                    "tags": "guide,tutorial",
                    "sort_order": 0,
                },
                {
                    "title": "Best Practices",
                    "subtitle": "Tips and tricks",
                    "body": "Discover the best practices to maximize your productivity.",
                    "image_url": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600",
                    "author": "Admin",
                    "tags": "tips,best-practices",
                    "sort_order": 1,
                },
                {
                    "title": "Advanced Features",
                    "subtitle": "Level up your skills",
                    "body": "Explore advanced features that will take your work to the next level.",
                    "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
                    "author": "Admin",
                    "tags": "advanced,features",
                    "sort_order": 2,
                },
            ],
        },
        {
            "id": "gallery-3",
            "type": "section",
            "name": "Gallery (3 images)",
            "description": "3 featured images for carousel display",
            "section_type": "gallery",
            "layout": "carousel",
            "contents": [
                {
                    "title": "Featured Image 1",
                    "subtitle": "Beautiful scenery",
                    "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
                    "sort_order": 0,
                },
                {
                    "title": "Featured Image 2",
                    "subtitle": "Urban landscape",
                    "image_url": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200",
                    "sort_order": 1,
                },
                {
                    "title": "Featured Image 3",
                    "subtitle": "Nature vibes",
                    "image_url": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200",
                    "sort_order": 2,
                },
            ],
        },
        {
            "id": "travel-3",
            "type": "section",
            "name": "Travel Cards (3 items)",
            "description": "3 travel destination cards",
            "section_type": "travel",
            "layout": "grid",
            "contents": [
                {
                    "title": "Paris, France",
                    "subtitle": "City of Light",
                    "body": "Experience the romance and culture of one of the world's most visited cities.",
                    "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600",
                    "tags": "europe,romantic",
                    "sort_order": 0,
                },
                {
                    "title": "Tokyo, Japan",
                    "subtitle": "Where tradition meets future",
                    "body": "Explore the vibrant blend of ancient temples and cutting-edge technology.",
                    "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600",
                    "tags": "asia,culture",
                    "sort_order": 1,
                },
                {
                    "title": "New York, USA",
                    "subtitle": "The city that never sleeps",
                    "body": "Discover the energy and diversity of the Big Apple.",
                    "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600",
                    "tags": "america,urban",
                    "sort_order": 2,
                },
            ],
        },
        {
            "id": "reviews-3",
            "type": "section",
            "name": "Reviews (3 items)",
            "description": "3 customer testimonial cards",
            "section_type": "review",
            "layout": "list",
            "contents": [
                {
                    "title": "Excellent Service",
                    "body": "This platform has completely transformed how we work. Highly recommended!",
                    "author": "John Doe",
                    "sort_order": 0,
                },
                {
                    "title": "Great Experience",
                    "body": "Easy to use and very powerful. The support team is fantastic.",
                    "author": "Jane Smith",
                    "sort_order": 1,
                },
                {
                    "title": "Outstanding Quality",
                    "body": "The best product we have ever used. Worth every penny.",
                    "author": "Mike Johnson",
                    "sort_order": 2,
                },
            ],
        },
        {
            "id": "products-3",
            "type": "section",
            "name": "Products (3 items)",
            "description": "3 product/plan showcase cards",
            "section_type": "featured",
            "layout": "grid",
            "contents": [
                {
                    "title": "Premium Plan",
                    "subtitle": "Best for professionals",
                    "body": "Full access to all features with priority support.",
                    "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
                    "tags": "premium,popular",
                    "sort_order": 0,
                },
                {
                    "title": "Business Plan",
                    "subtitle": "For growing teams",
                    "body": "Collaborate with your team and scale your business.",
                    "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
                    "tags": "business,teams",
                    "sort_order": 1,
                },
                {
                    "title": "Starter Plan",
                    "subtitle": "Perfect for beginners",
                    "body": "Get started with essential features at no cost.",
                    "image_url": "https://images.unsplash.com/photo-1553729459-uj4db6bd9184?w=600",
                    "tags": "starter,free",
                    "sort_order": 2,
                },
            ],
        },
        {
            "id": "team-grid-4",
            "type": "section",
            "name": "Team Members (4 items)",
            "description": "4 team member cards with photo, name, and role",
            "section_type": "team",
            "layout": "card",
            "contents": [
                {
                    "title": "Alex Nguyen",
                    "subtitle": "CEO & Founder",
                    "body": "Visionary leader with 15+ years of industry experience.",
                    "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
                    "sort_order": 0,
                },
                {
                    "title": "Maria Tran",
                    "subtitle": "CTO",
                    "body": "Tech innovator driving product development and architecture.",
                    "image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
                    "sort_order": 1,
                },
                {
                    "title": "David Le",
                    "subtitle": "Design Lead",
                    "body": "Creative designer shaping user experiences across all products.",
                    "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
                    "sort_order": 2,
                },
                {
                    "title": "Sophie Pham",
                    "subtitle": "Marketing Manager",
                    "body": "Strategic marketer growing brand awareness and engagement.",
                    "image_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
                    "sort_order": 3,
                },
            ],
        },
        {
            "id": "pricing-table-3",
            "type": "section",
            "name": "Pricing Table (3 plans)",
            "description": "3 pricing tiers with features and CTA buttons",
            "section_type": "pricing",
            "layout": "split",
            "contents": [
                {
                    "title": "Basic",
                    "subtitle": "$9/month",
                    "body": "5 Projects, 10GB Storage, Email Support, Basic Analytics",
                    "link_url": "#signup",
                    "tags": "basic,monthly",
                    "sort_order": 0,
                },
                {
                    "title": "Professional",
                    "subtitle": "$29/month",
                    "body": "Unlimited Projects, 100GB Storage, Priority Support, Advanced Analytics, API Access",
                    "link_url": "#signup",
                    "tags": "pro,monthly,popular",
                    "sort_order": 1,
                },
                {
                    "title": "Enterprise",
                    "subtitle": "$99/month",
                    "body": "Everything in Pro, Dedicated Server, Custom Integrations, SLA Guarantee, Account Manager",
                    "link_url": "#contact",
                    "tags": "enterprise,monthly",
                    "sort_order": 2,
                },
            ],
        },
        {
            "id": "faq-accordion-5",
            "type": "section",
            "name": "FAQ (5 questions)",
            "description": "5 frequently asked questions in accordion style",
            "section_type": "faq",
            "layout": "stacked",
            "contents": [
                {
                    "title": "How do I get started?",
                    "body": "Simply sign up for an account, choose your plan, and you can start using the platform immediately. Our onboarding wizard will guide you through the setup process.",
                    "sort_order": 0,
                },
                {
                    "title": "Can I change my plan later?",
                    "body": "Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes take effect at the start of the next billing cycle.",
                    "sort_order": 1,
                },
                {
                    "title": "Is there a free trial?",
                    "body": "We offer a 14-day free trial on all plans. No credit card required to start your trial.",
                    "sort_order": 2,
                },
                {
                    "title": "What payment methods do you accept?",
                    "body": "We accept all major credit cards, PayPal, and bank transfers for enterprise customers.",
                    "sort_order": 3,
                },
                {
                    "title": "How do I contact support?",
                    "body": "You can reach our support team via email, live chat, or phone. Enterprise customers get a dedicated account manager.",
                    "sort_order": 4,
                },
            ],
        },
        {
            "id": "news-ticker-5",
            "type": "section",
            "name": "News Feed (5 items)",
            "description": "5 latest news items in timeline layout",
            "section_type": "news",
            "layout": "timeline",
            "contents": [
                {
                    "title": "Company Raises Series B Funding",
                    "subtitle": "March 2026",
                    "body": "We are thrilled to announce our Series B round of $50M led by top-tier investors.",
                    "tags": "funding,news",
                    "sort_order": 0,
                },
                {
                    "title": "New Product Launch",
                    "subtitle": "February 2026",
                    "body": "Introducing our next-generation platform with AI-powered features.",
                    "tags": "product,launch",
                    "sort_order": 1,
                },
                {
                    "title": "Partnership with Global Tech",
                    "subtitle": "January 2026",
                    "body": "Strategic partnership to expand our services to 30+ new countries.",
                    "tags": "partnership,expansion",
                    "sort_order": 2,
                },
                {
                    "title": "100K Users Milestone",
                    "subtitle": "December 2025",
                    "body": "We have reached 100,000 active users! Thank you for your trust.",
                    "tags": "milestone,growth",
                    "sort_order": 3,
                },
                {
                    "title": "Community Event Recap",
                    "subtitle": "November 2025",
                    "body": "Our annual developer conference brought together 2,000+ attendees.",
                    "tags": "event,community",
                    "sort_order": 4,
                },
            ],
        },
        {
            "id": "feature-showcase-4",
            "type": "section",
            "name": "Feature Showcase (4 items)",
            "description": "4 key features displayed in masonry layout with icons",
            "section_type": "feature",
            "layout": "masonry",
            "contents": [
                {
                    "title": "Lightning Fast",
                    "subtitle": "Optimized Performance",
                    "body": "Built for speed with cutting-edge technology. Pages load in under 200ms.",
                    "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600",
                    "sort_order": 0,
                },
                {
                    "title": "Secure by Design",
                    "subtitle": "Enterprise Security",
                    "body": "End-to-end encryption, SOC2 compliant, and regular security audits.",
                    "image_url": "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=600",
                    "sort_order": 1,
                },
                {
                    "title": "Scalable Infrastructure",
                    "subtitle": "Grow Without Limits",
                    "body": "Auto-scaling infrastructure that handles millions of requests effortlessly.",
                    "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600",
                    "sort_order": 2,
                },
                {
                    "title": "24/7 Support",
                    "subtitle": "Always Here to Help",
                    "body": "Our dedicated support team is available around the clock to assist you.",
                    "image_url": "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600",
                    "sort_order": 3,
                },
            ],
        },
        {
            "id": "portfolio-masonry-6",
            "type": "section",
            "name": "Portfolio Masonry (6 items)",
            "description": "6 portfolio pieces in masonry layout with varied sizes",
            "section_type": "portfolio",
            "layout": "masonry",
            "contents": [
                {
                    "title": "Brand Identity Design",
                    "subtitle": "Branding Project",
                    "body": "Complete brand identity redesign for a fintech startup.",
                    "image_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600",
                    "tags": "branding,design",
                    "sort_order": 0,
                },
                {
                    "title": "Mobile App UI",
                    "subtitle": "App Design",
                    "body": "iOS and Android app design for a health & wellness platform.",
                    "image_url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600",
                    "tags": "mobile,ui",
                    "sort_order": 1,
                },
                {
                    "title": "E-commerce Website",
                    "subtitle": "Web Development",
                    "body": "Full-stack e-commerce solution with payment integration.",
                    "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
                    "tags": "web,ecommerce",
                    "sort_order": 2,
                },
                {
                    "title": "Dashboard Analytics",
                    "subtitle": "Data Visualization",
                    "body": "Interactive analytics dashboard with real-time data feeds.",
                    "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
                    "tags": "dashboard,analytics",
                    "sort_order": 3,
                },
                {
                    "title": "Marketing Campaign",
                    "subtitle": "Digital Marketing",
                    "body": "Multi-channel marketing campaign that drove 300% ROI.",
                    "image_url": "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600",
                    "tags": "marketing,digital",
                    "sort_order": 4,
                },
                {
                    "title": "Product Photography",
                    "subtitle": "Photography",
                    "body": "Professional product photography for a luxury brand catalog.",
                    "image_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
                    "tags": "photography,product",
                    "sort_order": 5,
                },
            ],
        },
        {
            "id": "stats-counter-4",
            "type": "section",
            "name": "Statistics Counter (4 items)",
            "description": "4 animated statistics counters with icons",
            "section_type": "stats",
            "layout": "grid",
            "contents": [
                {
                    "title": "10,000+",
                    "subtitle": "Active Users",
                    "body": "Growing community of professionals using our platform daily.",
                    "sort_order": 0,
                },
                {
                    "title": "50+",
                    "subtitle": "Countries",
                    "body": "Our services reach customers across more than 50 countries worldwide.",
                    "sort_order": 1,
                },
                {
                    "title": "99.9%",
                    "subtitle": "Uptime",
                    "body": "Industry-leading reliability with guaranteed uptime SLA.",
                    "sort_order": 2,
                },
                {
                    "title": "24/7",
                    "subtitle": "Support",
                    "body": "Round-the-clock customer support to assist you anytime.",
                    "sort_order": 3,
                },
            ],
        },
        {
            "id": "event-schedule-3",
            "type": "section",
            "name": "Event Schedule (3 sessions)",
            "description": "3 upcoming event sessions with date, time, and speaker",
            "section_type": "event",
            "layout": "timeline",
            "contents": [
                {
                    "title": "Opening Keynote: Future of AI",
                    "subtitle": "April 15, 2026 - 9:00 AM",
                    "body": "Join our CEO for an inspiring look at how AI is transforming industries.",
                    "author": "Alex Nguyen",
                    "tags": "keynote,ai",
                    "sort_order": 0,
                },
                {
                    "title": "Workshop: Building Scalable Systems",
                    "subtitle": "April 15, 2026 - 2:00 PM",
                    "body": "Hands-on workshop on designing and implementing scalable architectures.",
                    "author": "Maria Tran",
                    "tags": "workshop,engineering",
                    "sort_order": 1,
                },
                {
                    "title": "Panel: Women in Tech",
                    "subtitle": "April 16, 2026 - 10:00 AM",
                    "body": "Industry leaders discuss diversity, inclusion, and career growth in technology.",
                    "author": "Panel Discussion",
                    "tags": "panel,diversity",
                    "sort_order": 2,
                },
            ],
        },
        {
            "id": "video-featured-2",
            "type": "section",
            "name": "Featured Videos (2 items)",
            "description": "2 featured video content cards with play buttons",
            "section_type": "video",
            "layout": "split",
            "contents": [
                {
                    "title": "Product Demo",
                    "subtitle": "See our platform in action",
                    "body": "Watch a complete walkthrough of our platform features and capabilities.",
                    "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    "image_url": "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800",
                    "sort_order": 0,
                },
                {
                    "title": "Customer Success Story",
                    "subtitle": "How Company X grew 300%",
                    "body": "Learn how our customer achieved remarkable growth using our solutions.",
                    "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    "image_url": "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800",
                    "sort_order": 1,
                },
            ],
        },
        {
            "id": "notification-banner-3",
            "type": "section",
            "name": "Notification Banners (3 items)",
            "description": "3 announcement banners with dismissible alerts",
            "section_type": "announcement",
            "layout": "stacked",
            "contents": [
                {
                    "title": "System Maintenance Notice",
                    "subtitle": "Scheduled for April 10, 2026",
                    "body": "We will be performing scheduled maintenance from 2:00 AM to 4:00 AM UTC. Some services may be temporarily unavailable.",
                    "tags": "maintenance,alert",
                    "sort_order": 0,
                },
                {
                    "title": "New Feature Released!",
                    "subtitle": "Dashboard 2.0 is here",
                    "body": "Check out the new analytics dashboard with real-time charts, custom widgets, and export capabilities.",
                    "tags": "feature,update",
                    "sort_order": 1,
                },
                {
                    "title": "Holiday Promotion",
                    "subtitle": "Save 30% this month",
                    "body": "Use code SPRING2026 at checkout to get 30% off all annual plans. Limited time offer!",
                    "tags": "promotion,discount",
                    "link_url": "#pricing",
                    "sort_order": 2,
                },
            ],
        },
    ]

    # ─── PAGE TEMPLATES (full page) ──────────────────────
    # Complete page layout with multiple sections.
    # Creates the entire page structure from top to bottom.
    PAGE_TEMPLATES = [
        {
            "id": "corporate-homepage",
            "type": "page",
            "name": "Corporate Homepage",
            "description": "Professional homepage with hero, services, testimonials, and CTA",
            "sections": [
                {
                    "title": "Hero Banner",
                    "section_type": "general",
                    "layout": "hero",
                    "description": "Main landing section",
                    "contents": [
                        {
                            "title": "Welcome to Our Company",
                            "subtitle": "Innovation meets excellence",
                            "body": "We deliver world-class solutions for your business needs.",
                            "image_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
                            "link_url": "#services",
                            "sort_order": 0,
                        },
                    ],
                },
                {
                    "title": "Our Services",
                    "section_type": "featured",
                    "layout": "grid",
                    "description": "What we offer",
                    "contents": [
                        {
                            "title": "Consulting",
                            "subtitle": "Expert guidance",
                            "body": "Strategic consulting to help your business grow.",
                            "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600",
                            "sort_order": 0,
                        },
                        {
                            "title": "Development",
                            "subtitle": "Custom solutions",
                            "body": "Build powerful applications tailored to your needs.",
                            "image_url": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600",
                            "sort_order": 1,
                        },
                        {
                            "title": "Support",
                            "subtitle": "24/7 assistance",
                            "body": "Round-the-clock support to keep you running smoothly.",
                            "image_url": "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600",
                            "sort_order": 2,
                        },
                    ],
                },
                {
                    "title": "Testimonials",
                    "section_type": "review",
                    "layout": "list",
                    "description": "What our clients say",
                    "contents": [
                        {
                            "title": "Outstanding Partner",
                            "body": "They transformed our business. Highly recommended!",
                            "author": "Sarah Johnson",
                            "sort_order": 0,
                        },
                        {
                            "title": "Exceptional Quality",
                            "body": "The best investment we ever made for our company.",
                            "author": "Michael Chen",
                            "sort_order": 1,
                        },
                    ],
                },
                {
                    "title": "Contact Us",
                    "section_type": "general",
                    "layout": "hero",
                    "description": "Get in touch",
                    "contents": [
                        {
                            "title": "Ready to Get Started?",
                            "subtitle": "Let's talk about your project",
                            "body": "Reach out to us and discover how we can help you succeed.",
                            "link_url": "#contact",
                            "sort_order": 0,
                        },
                    ],
                },
            ],
        },
        {
            "id": "blog-homepage",
            "type": "page",
            "name": "Blog Homepage",
            "description": "Blog landing page with featured post, recent articles, and categories",
            "sections": [
                {
                    "title": "Featured Post",
                    "section_type": "blog",
                    "layout": "hero",
                    "description": "Highlighted article",
                    "contents": [
                        {
                            "title": "The Future of Technology",
                            "subtitle": "Trends shaping 2026",
                            "body": "An in-depth look at the technologies that will define the coming year.",
                            "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
                            "author": "Editor",
                            "tags": "technology,trends",
                            "sort_order": 0,
                        },
                    ],
                },
                {
                    "title": "Recent Articles",
                    "section_type": "blog",
                    "layout": "grid",
                    "description": "Latest posts",
                    "contents": [
                        {
                            "title": "Getting Started with AI",
                            "subtitle": "A beginner's guide",
                            "body": "Everything you need to know to start your AI journey.",
                            "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600",
                            "author": "Tech Writer",
                            "tags": "ai,guide",
                            "sort_order": 0,
                        },
                        {
                            "title": "Web Development Tips",
                            "subtitle": "Best practices",
                            "body": "Improve your web development workflow with these tips.",
                            "image_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600",
                            "author": "Dev Writer",
                            "tags": "web,tips",
                            "sort_order": 1,
                        },
                        {
                            "title": "Design Principles",
                            "subtitle": "Creating great UX",
                            "body": "Key principles for designing user-friendly interfaces.",
                            "image_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600",
                            "author": "Design Writer",
                            "tags": "design,ux",
                            "sort_order": 2,
                        },
                    ],
                },
            ],
        },
        {
            "id": "travel-homepage",
            "type": "page",
            "name": "Travel Homepage",
            "description": "Travel site with hero, destinations, gallery, and reviews",
            "sections": [
                {
                    "title": "Explore the World",
                    "section_type": "travel",
                    "layout": "hero",
                    "description": "Main hero section",
                    "contents": [
                        {
                            "title": "Discover Amazing Places",
                            "subtitle": "Your adventure starts here",
                            "body": "Explore breathtaking destinations around the globe with us.",
                            "image_url": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200",
                            "sort_order": 0,
                        },
                    ],
                },
                {
                    "title": "Top Destinations",
                    "section_type": "travel",
                    "layout": "grid",
                    "description": "Popular travel spots",
                    "contents": [
                        {
                            "title": "Bali, Indonesia",
                            "subtitle": "Island paradise",
                            "body": "Tropical beaches, ancient temples, and vibrant culture.",
                            "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600",
                            "tags": "asia,beach",
                            "sort_order": 0,
                        },
                        {
                            "title": "Santorini, Greece",
                            "subtitle": "Aegean gem",
                            "body": "Stunning sunsets and iconic white-washed architecture.",
                            "image_url": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600",
                            "tags": "europe,romantic",
                            "sort_order": 1,
                        },
                        {
                            "title": "Kyoto, Japan",
                            "subtitle": "Ancient capital",
                            "body": "Traditional gardens, shrines, and timeless beauty.",
                            "image_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600",
                            "tags": "asia,culture",
                            "sort_order": 2,
                        },
                    ],
                },
                {
                    "title": "Photo Gallery",
                    "section_type": "gallery",
                    "layout": "carousel",
                    "description": "Travel photography",
                    "contents": [
                        {
                            "title": "Mountain Sunrise",
                            "image_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200",
                            "sort_order": 0,
                        },
                        {
                            "title": "Ocean Waves",
                            "image_url": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200",
                            "sort_order": 1,
                        },
                    ],
                },
                {
                    "title": "Traveler Reviews",
                    "section_type": "review",
                    "layout": "list",
                    "description": "What travelers say",
                    "contents": [
                        {
                            "title": "Life-changing experience",
                            "body": "The best travel agency I have ever worked with!",
                            "author": "Emily R.",
                            "sort_order": 0,
                        },
                        {
                            "title": "Unforgettable memories",
                            "body": "Every trip exceeded our expectations. Thank you!",
                            "author": "David K.",
                            "sort_order": 1,
                        },
                    ],
                },
            ],
        },
        {
            "id": "saas-landing",
            "type": "page",
            "name": "SaaS Landing Page",
            "description": "Software product landing page with hero, features, pricing, and FAQ",
            "sections": [
                {
                    "title": "Hero Section",
                    "section_type": "general",
                    "layout": "hero",
                    "description": "Product introduction",
                    "contents": [
                        {
                            "title": "Build Better Products Faster",
                            "subtitle": "The all-in-one platform for modern teams",
                            "body": "Streamline your workflow, collaborate seamlessly, and ship products that delight your customers.",
                            "image_url": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200",
                            "link_url": "#pricing",
                            "sort_order": 0,
                        },
                    ],
                },
                {
                    "title": "Key Features",
                    "section_type": "feature",
                    "layout": "grid",
                    "description": "Why choose us",
                    "contents": [
                        {
                            "title": "Lightning Fast",
                            "subtitle": "Optimized Performance",
                            "body": "Pages load in under 200ms with our globally distributed CDN.",
                            "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600",
                            "sort_order": 0,
                        },
                        {
                            "title": "Secure by Design",
                            "subtitle": "Enterprise Security",
                            "body": "SOC2 compliant with end-to-end encryption.",
                            "image_url": "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=600",
                            "sort_order": 1,
                        },
                        {
                            "title": "24/7 Support",
                            "subtitle": "Always Here to Help",
                            "body": "Our dedicated support team is available around the clock.",
                            "image_url": "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600",
                            "sort_order": 2,
                        },
                    ],
                },
                {
                    "title": "Pricing",
                    "section_type": "pricing",
                    "layout": "pricing",
                    "description": "Choose your plan",
                    "contents": [
                        {
                            "title": "Starter",
                            "subtitle": "$0/month",
                            "body": "For individuals getting started. 3 projects, 1GB storage.",
                            "tags": "free",
                            "sort_order": 0,
                        },
                        {
                            "title": "Pro",
                            "subtitle": "$19/month",
                            "body": "For growing teams. Unlimited projects, 50GB storage, priority support.",
                            "tags": "popular",
                            "sort_order": 1,
                        },
                        {
                            "title": "Enterprise",
                            "subtitle": "Custom pricing",
                            "body": "For large organizations. Custom integrations, SLA, dedicated support.",
                            "tags": "enterprise",
                            "sort_order": 2,
                        },
                    ],
                },
                {
                    "title": "Frequently Asked Questions",
                    "section_type": "faq",
                    "layout": "list",
                    "description": "Common questions",
                    "contents": [
                        {
                            "title": "Is there a free trial?",
                            "body": "Yes, all plans come with a 14-day free trial. No credit card required.",
                            "sort_order": 0,
                        },
                        {
                            "title": "Can I cancel anytime?",
                            "body": "Absolutely. You can cancel your subscription at any time with no penalties.",
                            "sort_order": 1,
                        },
                    ],
                },
            ],
        },
        {
            "id": "portfolio-showcase",
            "type": "page",
            "name": "Portfolio Showcase",
            "description": "Creative portfolio with hero intro, masonry gallery, and contact",
            "sections": [
                {
                    "title": "Introduction",
                    "section_type": "general",
                    "layout": "hero",
                    "description": "About the creator",
                    "contents": [
                        {
                            "title": "Creative Design Studio",
                            "subtitle": "We craft digital experiences",
                            "body": "A multidisciplinary design studio specializing in branding, web design, and digital marketing.",
                            "image_url": "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200",
                            "sort_order": 0,
                        },
                    ],
                },
                {
                    "title": "Selected Works",
                    "section_type": "portfolio",
                    "layout": "masonry",
                    "description": "Our best projects",
                    "contents": [
                        {
                            "title": "Brand Identity",
                            "subtitle": "Fintech Startup",
                            "body": "Complete brand redesign including logo, colors, and guidelines.",
                            "image_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600",
                            "tags": "branding",
                            "sort_order": 0,
                        },
                        {
                            "title": "Mobile App",
                            "subtitle": "Health Platform",
                            "body": "iOS and Android app design for a wellness platform.",
                            "image_url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600",
                            "tags": "mobile",
                            "sort_order": 1,
                        },
                        {
                            "title": "Web Platform",
                            "subtitle": "E-commerce",
                            "body": "Full-stack e-commerce solution with modern UI.",
                            "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
                            "tags": "web",
                            "sort_order": 2,
                        },
                    ],
                },
                {
                    "title": "Client Reviews",
                    "section_type": "review",
                    "layout": "list",
                    "description": "What clients say",
                    "contents": [
                        {
                            "title": "Incredible Attention to Detail",
                            "body": "The team delivered beyond our expectations. Every pixel was perfect.",
                            "author": "Alex Rivera",
                            "sort_order": 0,
                        },
                        {
                            "title": "A True Creative Partner",
                            "body": "They understood our vision and brought it to life beautifully.",
                            "author": "Lisa Wang",
                            "sort_order": 1,
                        },
                    ],
                },
                {
                    "title": "Let's Work Together",
                    "section_type": "general",
                    "layout": "hero",
                    "description": "Contact CTA",
                    "contents": [
                        {
                            "title": "Start Your Project",
                            "subtitle": "We'd love to hear from you",
                            "body": "Get in touch to discuss your next project and receive a free consultation.",
                            "link_url": "#contact",
                            "sort_order": 0,
                        },
                    ],
                },
            ],
        },
        {
            "id": "ecommerce-homepage",
            "type": "page",
            "name": "E-commerce Homepage",
            "description": "Online store with hero promo, featured products, and newsletter",
            "sections": [
                {
                    "title": "Spring Collection",
                    "section_type": "general",
                    "layout": "hero",
                    "description": "Seasonal promotion",
                    "contents": [
                        {
                            "title": "Spring Collection 2026",
                            "subtitle": "Fresh styles for the new season",
                            "body": "Discover our latest arrivals with up to 30% off on selected items.",
                            "image_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
                            "link_url": "#shop",
                            "sort_order": 0,
                        },
                    ],
                },
                {
                    "title": "Featured Products",
                    "section_type": "featured",
                    "layout": "featured",
                    "description": "Best sellers",
                    "contents": [
                        {
                            "title": "Classic Leather Bag",
                            "subtitle": "$129.00",
                            "body": "Handcrafted genuine leather with premium hardware.",
                            "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
                            "tags": "bags,leather",
                            "sort_order": 0,
                        },
                        {
                            "title": "Wireless Headphones",
                            "subtitle": "$89.00",
                            "body": "Active noise cancellation with 30-hour battery life.",
                            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
                            "tags": "audio,tech",
                            "sort_order": 1,
                        },
                        {
                            "title": "Minimalist Watch",
                            "subtitle": "$199.00",
                            "body": "Swiss movement, sapphire crystal, Italian leather strap.",
                            "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
                            "tags": "watches,accessories",
                            "sort_order": 2,
                        },
                    ],
                },
                {
                    "title": "Photo Gallery",
                    "section_type": "gallery",
                    "layout": "carousel",
                    "description": "Lifestyle images",
                    "contents": [
                        {
                            "title": "Lifestyle Shot 1",
                            "image_url": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
                            "sort_order": 0,
                        },
                        {
                            "title": "Lifestyle Shot 2",
                            "image_url": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
                            "sort_order": 1,
                        },
                    ],
                },
                {
                    "title": "Customer Reviews",
                    "section_type": "review",
                    "layout": "testimonial",
                    "description": "What customers say",
                    "contents": [
                        {
                            "title": "Love the Quality!",
                            "body": "The leather bag exceeded my expectations. Beautiful craftsmanship.",
                            "author": "Amanda T.",
                            "sort_order": 0,
                        },
                        {
                            "title": "Fast Shipping",
                            "body": "Ordered on Monday, arrived on Wednesday. Packaging was perfect.",
                            "author": "Robert M.",
                            "sort_order": 1,
                        },
                        {
                            "title": "Best Customer Service",
                            "body": "Had an issue with my order and they resolved it within hours.",
                            "author": "Jennifer L.",
                            "sort_order": 2,
                        },
                    ],
                },
            ],
        },
        {
            "id": "about-page",
            "type": "page",
            "name": "About Us Page",
            "description": "Company about page with story, team, stats, and values",
            "sections": [
                {
                    "title": "Our Story",
                    "section_type": "general",
                    "layout": "split",
                    "description": "Company story",
                    "contents": [
                        {
                            "title": "Our Story",
                            "subtitle": "Founded in 2020",
                            "body": "We started with a simple mission: to make technology accessible to everyone. What began as a small team of passionate engineers has grown into a global company serving thousands of customers worldwide.",
                            "image_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
                            "sort_order": 0,
                        },
                    ],
                },
                {
                    "title": "Our Numbers",
                    "section_type": "stats",
                    "layout": "grid",
                    "description": "Key statistics",
                    "contents": [
                        {
                            "title": "10,000+",
                            "subtitle": "Happy Customers",
                            "body": "Businesses trust us with their operations.",
                            "sort_order": 0,
                        },
                        {
                            "title": "50+",
                            "subtitle": "Team Members",
                            "body": "Talented professionals across 10 countries.",
                            "sort_order": 1,
                        },
                        {
                            "title": "99.9%",
                            "subtitle": "Uptime",
                            "body": "Reliable service you can count on.",
                            "sort_order": 2,
                        },
                        {
                            "title": "24/7",
                            "subtitle": "Support",
                            "body": "Always available when you need us.",
                            "sort_order": 3,
                        },
                    ],
                },
                {
                    "title": "Our Team",
                    "section_type": "team",
                    "layout": "grid",
                    "description": "Meet the team",
                    "contents": [
                        {
                            "title": "Alex Nguyen",
                            "subtitle": "CEO & Founder",
                            "body": "Visionary leader with 15+ years in tech.",
                            "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
                            "sort_order": 0,
                        },
                        {
                            "title": "Maria Tran",
                            "subtitle": "CTO",
                            "body": "Tech innovator driving product development.",
                            "image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
                            "sort_order": 1,
                        },
                        {
                            "title": "David Le",
                            "subtitle": "Head of Design",
                            "body": "Creative designer shaping user experiences.",
                            "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
                            "sort_order": 2,
                        },
                    ],
                },
                {
                    "title": "Customer Stories",
                    "section_type": "review",
                    "layout": "testimonial",
                    "description": "Testimonials",
                    "contents": [
                        {
                            "title": "Transformed Our Business",
                            "body": "Their platform helped us increase productivity by 40%.",
                            "author": "CEO, TechStartup Inc.",
                            "sort_order": 0,
                        },
                    ],
                },
            ],
        },
        {
            "id": "event-landing",
            "type": "page",
            "name": "Event Landing Page",
            "description": "Conference/event page with hero, schedule, speakers, and registration CTA",
            "sections": [
                {
                    "title": "Event Hero",
                    "section_type": "event",
                    "layout": "hero",
                    "description": "Event introduction",
                    "contents": [
                        {
                            "title": "TechConf 2026",
                            "subtitle": "April 15-16, 2026 | Ho Chi Minh City",
                            "body": "Join 2,000+ developers, designers, and tech leaders for two days of inspiration, learning, and networking.",
                            "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
                            "link_url": "#register",
                            "sort_order": 0,
                        },
                    ],
                },
                {
                    "title": "Event Schedule",
                    "section_type": "event",
                    "layout": "timeline",
                    "description": "Sessions",
                    "contents": [
                        {
                            "title": "Opening Keynote: Future of AI",
                            "subtitle": "Day 1 - 9:00 AM",
                            "body": "An inspiring look at how AI is transforming industries.",
                            "author": "Alex Nguyen",
                            "sort_order": 0,
                        },
                        {
                            "title": "Workshop: Scalable Systems",
                            "subtitle": "Day 1 - 2:00 PM",
                            "body": "Hands-on workshop on designing scalable architectures.",
                            "author": "Maria Tran",
                            "sort_order": 1,
                        },
                        {
                            "title": "Panel: Future of Work",
                            "subtitle": "Day 2 - 10:00 AM",
                            "body": "Industry leaders discuss remote work and collaboration tools.",
                            "author": "Panel Discussion",
                            "sort_order": 2,
                        },
                    ],
                },
                {
                    "title": "Gallery",
                    "section_type": "gallery",
                    "layout": "masonry",
                    "description": "Previous events",
                    "contents": [
                        {
                            "title": "TechConf 2025 Highlights",
                            "image_url": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600",
                            "sort_order": 0,
                        },
                        {
                            "title": "Networking Session",
                            "image_url": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600",
                            "sort_order": 1,
                        },
                        {
                            "title": "Workshop in Action",
                            "image_url": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600",
                            "sort_order": 2,
                        },
                    ],
                },
                {
                    "title": "Register Now",
                    "section_type": "general",
                    "layout": "hero",
                    "description": "Registration CTA",
                    "contents": [
                        {
                            "title": "Secure Your Spot",
                            "subtitle": "Early bird pricing ends March 31",
                            "body": "Don't miss the biggest tech event of the year. Register now and save 30%.",
                            "link_url": "#register",
                            "sort_order": 0,
                        },
                    ],
                },
            ],
        },
        {
            "id": "restaurant-homepage",
            "type": "page",
            "name": "Restaurant Homepage",
            "description": "Restaurant website with hero, menu highlights, gallery, and reservation CTA",
            "sections": [
                {
                    "title": "Welcome",
                    "section_type": "general",
                    "layout": "hero",
                    "description": "Restaurant intro",
                    "contents": [
                        {
                            "title": "La Maison Gourmet",
                            "subtitle": "Fine Dining Experience",
                            "body": "Experience the art of French cuisine in an elegant setting. Our chef crafts each dish with passion and the finest ingredients.",
                            "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200",
                            "link_url": "#reservations",
                            "sort_order": 0,
                        },
                    ],
                },
                {
                    "title": "Signature Dishes",
                    "section_type": "featured",
                    "layout": "grid",
                    "description": "Chef's specials",
                    "contents": [
                        {
                            "title": "Truffle Risotto",
                            "subtitle": "Chef's Signature",
                            "body": "Arborio rice with black truffle, parmesan, and wild mushrooms.",
                            "image_url": "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600",
                            "sort_order": 0,
                        },
                        {
                            "title": "Pan-Seared Salmon",
                            "subtitle": "Fresh Catch",
                            "body": "Atlantic salmon with lemon butter sauce and seasonal vegetables.",
                            "image_url": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600",
                            "sort_order": 1,
                        },
                        {
                            "title": "Chocolate Souffl\u00e9",
                            "subtitle": "Dessert",
                            "body": "Warm chocolate souffl\u00e9 with vanilla bean ice cream.",
                            "image_url": "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600",
                            "sort_order": 2,
                        },
                    ],
                },
                {
                    "title": "Restaurant Gallery",
                    "section_type": "gallery",
                    "layout": "carousel",
                    "description": "Ambiance photos",
                    "contents": [
                        {
                            "title": "Interior",
                            "image_url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
                            "sort_order": 0,
                        },
                        {
                            "title": "Kitchen",
                            "image_url": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200",
                            "sort_order": 1,
                        },
                    ],
                },
                {
                    "title": "Guest Reviews",
                    "section_type": "review",
                    "layout": "testimonial",
                    "description": "What diners say",
                    "contents": [
                        {
                            "title": "Absolutely Divine",
                            "body": "The truffle risotto was the best I've ever had. Impeccable service.",
                            "author": "Food Critic, Dining Magazine",
                            "sort_order": 0,
                        },
                        {
                            "title": "A Hidden Gem",
                            "body": "Worth every penny. The ambiance is perfect for a special occasion.",
                            "author": "Michelle P.",
                            "sort_order": 1,
                        },
                    ],
                },
            ],
        },
        {
            "id": "nonprofit-homepage",
            "type": "page",
            "name": "Non-Profit Homepage",
            "description": "Charity/nonprofit with hero mission, impact stats, stories, and donate CTA",
            "sections": [
                {
                    "title": "Our Mission",
                    "section_type": "general",
                    "layout": "hero",
                    "description": "Mission statement",
                    "contents": [
                        {
                            "title": "Together We Can Make a Difference",
                            "subtitle": "Empowering communities worldwide",
                            "body": "Our foundation works to provide education, healthcare, and clean water to underserved communities across 30 countries.",
                            "image_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200",
                            "link_url": "#donate",
                            "sort_order": 0,
                        },
                    ],
                },
                {
                    "title": "Our Impact",
                    "section_type": "stats",
                    "layout": "grid",
                    "description": "Impact numbers",
                    "contents": [
                        {
                            "title": "500,000+",
                            "subtitle": "Lives Impacted",
                            "body": "People who have benefited from our programs.",
                            "sort_order": 0,
                        },
                        {
                            "title": "30",
                            "subtitle": "Countries",
                            "body": "Where we operate active programs.",
                            "sort_order": 1,
                        },
                        {
                            "title": "1,200",
                            "subtitle": "Volunteers",
                            "body": "Dicated volunteers making a difference daily.",
                            "sort_order": 2,
                        },
                        {
                            "title": "$10M+",
                            "subtitle": "Funds Raised",
                            "body": "Invested directly into community programs.",
                            "sort_order": 3,
                        },
                    ],
                },
                {
                    "title": "Success Stories",
                    "section_type": "blog",
                    "layout": "split",
                    "description": "Impact stories",
                    "contents": [
                        {
                            "title": "Building Schools in Rural Areas",
                            "subtitle": "Education Program",
                            "body": "We've built 50 schools in remote villages, giving 10,000 children access to education for the first time.",
                            "image_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600",
                            "tags": "education,impact",
                            "sort_order": 0,
                        },
                        {
                            "title": "Clean Water Initiative",
                            "subtitle": "Water Program",
                            "body": "Our water wells now serve 200+ communities, providing safe drinking water to 100,000 people.",
                            "image_url": "https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=600",
                            "tags": "water,impact",
                            "sort_order": 1,
                        },
                    ],
                },
                {
                    "title": "Donate Now",
                    "section_type": "general",
                    "layout": "hero",
                    "description": "Donation CTA",
                    "contents": [
                        {
                            "title": "Every Dollar Counts",
                            "subtitle": "95% goes directly to programs",
                            "body": "Your donation helps us reach more communities and change more lives. Join our mission today.",
                            "link_url": "#donate",
                            "sort_order": 0,
                        },
                    ],
                },
            ],
        },
        {
            "id": "education-homepage",
            "type": "page",
            "name": "Education Homepage",
            "description": "Online learning platform with hero, course categories, testimonials, and enrollment CTA",
            "sections": [
                {
                    "title": "Start Learning Today",
                    "section_type": "general",
                    "layout": "hero",
                    "description": "Platform intro",
                    "contents": [
                        {
                            "title": "Learn Without Limits",
                            "subtitle": "10,000+ courses from expert instructors",
                            "body": "Start learning today with courses in development, design, business, and more. Join 1 million+ students worldwide.",
                            "image_url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200",
                            "link_url": "#courses",
                            "sort_order": 0,
                        },
                    ],
                },
                {
                    "title": "Popular Categories",
                    "section_type": "featured",
                    "layout": "grid",
                    "description": "Browse by category",
                    "contents": [
                        {
                            "title": "Web Development",
                            "subtitle": "500+ Courses",
                            "body": "HTML, CSS, JavaScript, React, Node.js, and more.",
                            "image_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600",
                            "tags": "development,web",
                            "sort_order": 0,
                        },
                        {
                            "title": "Data Science",
                            "subtitle": "300+ Courses",
                            "body": "Python, Machine Learning, AI, and Analytics.",
                            "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
                            "tags": "data,ai",
                            "sort_order": 1,
                        },
                        {
                            "title": "UI/UX Design",
                            "subtitle": "200+ Courses",
                            "body": "Figma, Adobe XD, prototyping, and design systems.",
                            "image_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600",
                            "tags": "design,ux",
                            "sort_order": 2,
                        },
                        {
                            "title": "Business",
                            "subtitle": "400+ Courses",
                            "body": "Marketing, finance, leadership, and entrepreneurship.",
                            "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600",
                            "tags": "business,marketing",
                            "sort_order": 3,
                        },
                    ],
                },
                {
                    "title": "Student Reviews",
                    "section_type": "review",
                    "layout": "list",
                    "description": "What students say",
                    "contents": [
                        {
                            "title": "Career Changing",
                            "body": "I went from zero coding knowledge to landing a developer job in 6 months.",
                            "author": "Thomas K.",
                            "sort_order": 0,
                        },
                        {
                            "title": "Best Online Platform",
                            "body": "The course quality is outstanding. Instructors are knowledgeable and engaging.",
                            "author": "Sarah L.",
                            "sort_order": 1,
                        },
                        {
                            "title": "Worth Every Penny",
                            "body": "The subscription pays for itself. I've completed 20+ courses and learned so much.",
                            "author": "James R.",
                            "sort_order": 2,
                        },
                    ],
                },
                {
                    "title": "Start Learning Free",
                    "section_type": "general",
                    "layout": "hero",
                    "description": "Enrollment CTA",
                    "contents": [
                        {
                            "title": "Start Your Learning Journey",
                            "subtitle": "First month free for new students",
                            "body": "Get unlimited access to all courses. Cancel anytime. No commitment required.",
                            "link_url": "#signup",
                            "sort_order": 0,
                        },
                    ],
                },
            ],
        },
        {
            "id": "product-showcase",
            "type": "page",
            "name": "Product Showcase",
            "description": "Product page with hero, feature showcase, pricing, and testimonials",
            "sections": [
                {
                    "title": "Product Hero",
                    "section_type": "general",
                    "layout": "hero",
                    "description": "Product introduction",
                    "contents": [
                        {
                            "title": "Introducing ProStudio",
                            "subtitle": "The creative suite for modern teams",
                            "body": "Design, prototype, and collaborate in one powerful platform. Trusted by 50,000+ teams worldwide.",
                            "image_url": "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200",
                            "link_url": "#pricing",
                            "sort_order": 0,
                        },
                    ],
                },
                {
                    "title": "Feature Showcase",
                    "section_type": "feature",
                    "layout": "showcase",
                    "description": "Key features in detail",
                    "contents": [
                        {
                            "title": "Real-time Collaboration",
                            "subtitle": "Work together seamlessly",
                            "body": "See changes instantly as your team collaborates. Comment, review, and iterate without friction.",
                            "image_url": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
                            "tags": "collaboration,real-time",
                            "sort_order": 0,
                        },
                        {
                            "title": "Smart Automation",
                            "subtitle": "Let AI handle the repetitive work",
                            "body": "Automate tedious tasks with intelligent workflows. Focus on what matters most.",
                            "image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
                            "tags": "automation,ai",
                            "sort_order": 1,
                        },
                        {
                            "title": "Advanced Analytics",
                            "subtitle": "Data-driven decisions",
                            "body": "Get actionable insights with powerful dashboards. Track performance and optimize your workflow.",
                            "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
                            "tags": "analytics,insights",
                            "sort_order": 2,
                        },
                    ],
                },
                {
                    "title": "Pricing Plans",
                    "section_type": "pricing",
                    "layout": "pricing",
                    "description": "Choose your plan",
                    "contents": [
                        {
                            "title": "Free",
                            "subtitle": "$0",
                            "body": "For individuals. 3 projects, 1GB storage, basic features.",
                            "tags": "free",
                            "sort_order": 0,
                        },
                        {
                            "title": "Professional",
                            "subtitle": "$29/mo",
                            "body": "For teams. Unlimited projects, 100GB storage, advanced features, priority support.",
                            "tags": "popular",
                            "link_url": "#signup",
                            "sort_order": 1,
                        },
                        {
                            "title": "Enterprise",
                            "subtitle": "Custom",
                            "body": "For organizations. Custom integrations, SLA, dedicated success manager.",
                            "tags": "enterprise",
                            "sort_order": 2,
                        },
                    ],
                },
                {
                    "title": "What Our Users Say",
                    "section_type": "review",
                    "layout": "testimonial",
                    "description": "Customer testimonials",
                    "contents": [
                        {
                            "title": "Head of Design",
                            "body": "ProStudio transformed how our team works. We ship designs 3x faster now.",
                            "author": "Jessica Kim",
                            "image_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
                            "sort_order": 0,
                        },
                        {
                            "title": "Product Manager",
                            "body": "The collaboration features are unmatched. Our remote team feels more connected than ever.",
                            "author": "Marcus Chen",
                            "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
                            "sort_order": 1,
                        },
                        {
                            "title": "Creative Director",
                            "body": "Finally a tool that keeps up with our creative process. Highly recommended!",
                            "author": "Sophia Laurent",
                            "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
                            "sort_order": 2,
                        },
                    ],
                },
            ],
        },
    ]

    # ─── LAYOUT DEFINITIONS ──────────────────────────
    LAYOUTS = [
        {
            "id": "grid",
            "name": "Grid",
            "description": "Responsive grid layout with equal-width columns",
            "icon": "grid_view",
            "category": "standard",
            "supports_columns": True,
            "default_columns": 3,
        },
        {
            "id": "list",
            "name": "List",
            "description": "Vertical list layout with full-width items",
            "icon": "view_list",
            "category": "standard",
            "supports_columns": False,
            "default_columns": 1,
        },
        {
            "id": "hero",
            "name": "Hero",
            "description": "Full-width hero banner with centered content",
            "icon": "view_carousel",
            "category": "banner",
            "supports_columns": False,
            "default_columns": 1,
        },
        {
            "id": "carousel",
            "name": "Carousel",
            "description": "Sliding carousel with navigation controls",
            "icon": "swipe",
            "category": "slider",
            "supports_columns": False,
            "default_columns": 1,
        },
        {
            "id": "masonry",
            "name": "Masonry",
            "description": "Pinterest-style masonry grid with variable heights",
            "icon": "dashboard",
            "category": "creative",
            "supports_columns": True,
            "default_columns": 3,
        },
        {
            "id": "featured",
            "name": "Featured",
            "description": "Large featured item with smaller items beside it",
            "icon": "star",
            "category": "highlight",
            "supports_columns": False,
            "default_columns": 1,
        },
        {
            "id": "sidebar",
            "name": "Sidebar",
            "description": "Two-column layout with main content and sidebar",
            "icon": "view_sidebar",
            "category": "standard",
            "supports_columns": False,
            "default_columns": 2,
        },
        {
            "id": "split",
            "name": "Split",
            "description": "Two equal columns side by side",
            "icon": "vertical_split",
            "category": "standard",
            "supports_columns": False,
            "default_columns": 2,
        },
        {
            "id": "stacked",
            "name": "Stacked",
            "description": "Vertically stacked full-width blocks",
            "icon": "layers",
            "category": "standard",
            "supports_columns": False,
            "default_columns": 1,
        },
        {
            "id": "card",
            "name": "Card Deck",
            "description": "Card-based layout with shadow and hover effects",
            "icon": "style",
            "category": "standard",
            "supports_columns": True,
            "default_columns": 3,
        },
        {
            "id": "timeline",
            "name": "Timeline",
            "description": "Chronological timeline with connected items",
            "icon": "timeline",
            "category": "creative",
            "supports_columns": False,
            "default_columns": 1,
        },
        {
            "id": "tabs",
            "name": "Tabs",
            "description": "Tabbed content with switchable panels",
            "icon": "tab",
            "category": "interactive",
            "supports_columns": False,
            "default_columns": 1,
        },
        {
            "id": "mosaic",
            "name": "Mosaic",
            "description": "Tiled mosaic grid with mixed-size cells",
            "icon": "grid_view",
            "category": "creative",
            "supports_columns": False,
            "default_columns": 4,
        },
        {
            "id": "pricing",
            "name": "Pricing",
            "description": "Pricing cards with featured center card",
            "icon": "payments",
            "category": "business",
            "supports_columns": True,
            "default_columns": 3,
        },
        {
            "id": "testimonial",
            "name": "Testimonial",
            "description": "Quote cards with avatar and author info",
            "icon": "format_quote",
            "category": "social",
            "supports_columns": True,
            "default_columns": 3,
        },
        {
            "id": "showcase",
            "name": "Showcase",
            "description": "Large alternating image-text rows",
            "icon": "auto_awesome",
            "category": "highlight",
            "supports_columns": False,
            "default_columns": 1,
        },
    ]

    @staticmethod
    def get_all_layouts():
        return TemplateService.LAYOUTS, None

    @staticmethod
    def get_layout_by_id(layout_id):
        for layout in TemplateService.LAYOUTS:
            if layout["id"] == layout_id:
                return layout, None
        return None, "Layout not found"

    @staticmethod
    def get_all_section_templates():
        return TemplateService.SECTION_TEMPLATES, None

    @staticmethod
    def get_all_page_templates():
        return TemplateService.PAGE_TEMPLATES, None

    @staticmethod
    def get_all_templates():
        return {
            "layouts": TemplateService.LAYOUTS,
            "section_templates": TemplateService.SECTION_TEMPLATES,
            "page_templates": TemplateService.PAGE_TEMPLATES,
        }, None

    @staticmethod
    def _find_template(template_id, templates):
        for t in templates:
            if t["id"] == template_id:
                return t, None
        return None, "Template not found"

    @staticmethod
    def apply_section_template(
        template_id, section_id=None, user_id=None, publish=False
    ):
        template, err = TemplateService._find_template(
            template_id, TemplateService.SECTION_TEMPLATES
        )
        if err:
            return None, err

        if section_id:
            section = PageSectionRepository.find_by_id(section_id)
            if not section:
                return None, "Section not found"
        else:
            next_order = SectionOrderService.get_next_section_order()
            section, err = PageSectionService.create(
                user_id=user_id,
                title=template["name"],
                section_type=template["section_type"],
                layout=template["layout"],
                description=template["description"],
                status="published" if publish else "draft",
                is_visible=True,
                sort_order=next_order,
                template_group=f"section:{template_id}",
                group_order=0,
            )
            if err:
                return None, err

        for c in template["contents"]:
            SectionContentService.create(
                section_id=section.id,
                title=c.get("title"),
                subtitle=c.get("subtitle"),
                body=c.get("body"),
                image_url=c.get("image_url"),
                video_url=c.get("video_url"),
                link_url=c.get("link_url"),
                tags=c.get("tags"),
                author=c.get("author"),
                sort_order=c.get("sort_order", 0),
            )

        log.info(
            f"TemplateService.apply_section_template | {template_id} → section={section.id} | publish={publish} | by={user_id}"
        )
        return section, None

    @staticmethod
    def apply_page_template(template_id, user_id=None, publish=False):
        template, err = TemplateService._find_template(
            template_id, TemplateService.PAGE_TEMPLATES
        )
        if err:
            return None, err

        # Check if template already applied
        existing = PageSection.query.filter_by(template_group=template_id).first()
        if existing:
            return (
                None,
                f"Template '{template_id}' is already applied. Each template can only be applied once.",
            )

        # Get next sort_order for the group
        start_order = SectionOrderService.get_next_section_order()
        group_name = template_id

        created_sections = []
        for i, sec_data in enumerate(template["sections"]):
            section, err = PageSectionService.create(
                user_id=user_id,
                title=sec_data["title"],
                section_type=sec_data.get("section_type", "general"),
                layout=sec_data.get("layout", "grid"),
                description=sec_data.get("description"),
                status="published" if publish else "draft",
                is_visible=True,
                sort_order=start_order + i,
                template_group=group_name,
                group_order=i,
            )
            if err:
                return None, err

            for c in sec_data.get("contents", []):
                SectionContentService.create(
                    section_id=section.id,
                    title=c.get("title"),
                    subtitle=c.get("subtitle"),
                    body=c.get("body"),
                    image_url=c.get("image_url"),
                    video_url=c.get("video_url"),
                    link_url=c.get("link_url"),
                    tags=c.get("tags"),
                    author=c.get("author"),
                    sort_order=c.get("sort_order", 0),
                )
            created_sections.append(section)

        log.info(
            f"TemplateService.apply_page_template | {template_id} → {len(created_sections)} sections | group={group_name} | publish={publish} | by={user_id}"
        )
        return created_sections, None

    @staticmethod
    def get_template_group_status(template_id):
        """Get status of all sections in a template group."""
        sections = PageSection.query.filter_by(template_group=template_id).all()
        if not sections:
            return None, "No sections found for this template group"

        total = len(sections)
        published = sum(1 for s in sections if s.status == "published")
        draft = total - published
        visible = sum(1 for s in sections if s.is_visible)
        hidden = total - visible
        displayed = sum(1 for s in sections if s.is_visible and s.status == "published")

        return {
            "template_group": template_id,
            "total_sections": total,
            "published": published,
            "draft": draft,
            "visible": visible,
            "hidden": hidden,
            "displayed": displayed,
            "all_published": published == total,
            "all_draft": draft == total,
            "sections": [s.to_dict_admin() for s in sections],
        }, None

    @staticmethod
    def get_applied_template_groups():
        """Get list of template group names that have already been applied."""
        rows = (
            db.session.query(PageSection.template_group)
            .filter(PageSection.template_group.isnot(None))
            .distinct()
            .all()
        )
        return [r[0] for r in rows]

    @staticmethod
    def publish_template_group(template_id, user_id=None):
        """Publish all sections in a template group at once."""
        sections = PageSection.query.filter_by(template_group=template_id).all()
        if not sections:
            return None, "No sections found for this template group"

        for section in sections:
            section.status = "published"

        db.session.commit()

        log.info(
            f"TemplateService.publish_template_group | group={template_id} | count={len(sections)} | by={user_id}"
        )
        return len(sections), None

    @staticmethod
    def unpublish_template_group(template_id, user_id=None):
        """Unpublish all sections in a template group at once."""
        sections = PageSection.query.filter_by(template_group=template_id).all()
        if not sections:
            return None, "No sections found for this template group"

        for section in sections:
            section.status = "draft"

        db.session.commit()

        log.info(
            f"TemplateService.unpublish_template_group | group={template_id} | count={len(sections)} | by={user_id}"
        )
        return len(sections), None

    @staticmethod
    def show_template_group(template_id, user_id=None):
        """Show all sections in a template group."""
        count = PageSection.query.filter_by(template_group=template_id).update(
            {"is_visible": True}
        )
        db.session.commit()
        log.info(
            f"TemplateService.show_template_group | group={template_id} | count={count} | by={user_id}"
        )
        return count, None

    @staticmethod
    def hide_template_group(template_id, user_id=None):
        """Hide all sections in a template group."""
        count = PageSection.query.filter_by(template_group=template_id).update(
            {"is_visible": False}
        )
        db.session.commit()
        log.info(
            f"TemplateService.hide_template_group | group={template_id} | count={count} | by={user_id}"
        )
        return count, None

    @staticmethod
    def delete_template_group(template_id, user_id=None):
        """Delete all sections and contents in a template group."""
        sections = PageSection.query.filter_by(template_group=template_id).all()
        if not sections:
            return 0, None

        count = 0
        for section in sections:
            SectionContentRepository.delete_by_section(section.id)
            PageSectionRepository.delete(section)
            count += 1

        db.session.commit()
        log.info(
            f"TemplateService.delete_template_group | group={template_id} | count={count} | by={user_id}"
        )
        return count, None
