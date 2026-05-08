from src.api.models import db, PageSection, SectionContent, User
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()


SAMPLE_SECTIONS = [
    {
        "title": "Welcome Hero",
        "section_type": "general",
        "layout": "hero",
        "description": "Main hero banner for the homepage",
        "sort_order": 0,
        "is_visible": True,
        "status": "published",
        "max_items": 1,
        "background_color": "#1a1a2e",
        "contents": [
            {
                "title": "Welcome to Soppadop",
                "subtitle": "Build Beautiful Websites with Ease",
                "body": "The all-in-one platform for creating stunning web pages with powerful content management tools.",
                "image_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200",
                "link_url": "#features",
                "sort_order": 0,
            },
        ],
    },
    {
        "title": "Key Features",
        "section_type": "feature",
        "layout": "grid",
        "description": "Platform key features showcase",
        "sort_order": 1,
        "is_visible": True,
        "status": "published",
        "max_items": 3,
        "contents": [
            {
                "title": "Easy Content Management",
                "subtitle": "Intuitive CMS",
                "body": "Create, edit, and manage your content with our user-friendly drag-and-drop interface.",
                "image_url": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600",
                "tags": "cms,easy",
                "sort_order": 0,
            },
            {
                "title": "Responsive Design",
                "subtitle": "Mobile-First",
                "body": "All layouts are fully responsive and look great on any device, from phones to desktops.",
                "image_url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600",
                "tags": "responsive,mobile",
                "sort_order": 1,
            },
            {
                "title": "Powerful Analytics",
                "subtitle": "Data-Driven",
                "body": "Track visitor behavior, content performance, and engagement with built-in analytics.",
                "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
                "tags": "analytics,data",
                "sort_order": 2,
            },
        ],
    },
    {
        "title": "Latest Blog Posts",
        "section_type": "blog",
        "layout": "card",
        "description": "Recent articles from our blog",
        "sort_order": 2,
        "is_visible": True,
        "status": "published",
        "max_items": 3,
        "contents": [
            {
                "title": "10 Tips for Better Web Design",
                "subtitle": "Design Best Practices",
                "body": "Learn the top 10 principles that will make your websites stand out from the competition.",
                "image_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600",
                "author": "Design Team",
                "tags": "design,tips",
                "sort_order": 0,
            },
            {
                "title": "The Future of AI in Web Development",
                "subtitle": "Technology Trends",
                "body": "How artificial intelligence is transforming the way we build and manage websites.",
                "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600",
                "author": "Tech Writer",
                "tags": "ai,technology",
                "sort_order": 1,
            },
            {
                "title": "SEO Strategies for 2026",
                "subtitle": "Marketing Guide",
                "body": "Stay ahead of the curve with these proven SEO strategies for the new year.",
                "image_url": "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600",
                "author": "Marketing Team",
                "tags": "seo,marketing",
                "sort_order": 2,
            },
        ],
    },
    {
        "title": "Photo Gallery",
        "section_type": "gallery",
        "layout": "masonry",
        "description": "Visual showcase of our work",
        "sort_order": 3,
        "is_visible": True,
        "status": "published",
        "max_items": 6,
        "contents": [
            {
                "title": "Project Alpha",
                "subtitle": "Web Design",
                "image_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600",
                "tags": "design,web",
                "sort_order": 0,
            },
            {
                "title": "Project Beta",
                "subtitle": "Mobile App",
                "image_url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600",
                "tags": "mobile,app",
                "sort_order": 1,
            },
            {
                "title": "Project Gamma",
                "subtitle": "Branding",
                "image_url": "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600",
                "tags": "branding,identity",
                "sort_order": 2,
            },
            {
                "title": "Project Delta",
                "subtitle": "Dashboard",
                "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
                "tags": "dashboard,analytics",
                "sort_order": 3,
            },
            {
                "title": "Project Epsilon",
                "subtitle": "E-commerce",
                "image_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
                "tags": "ecommerce,shop",
                "sort_order": 4,
            },
            {
                "title": "Project Zeta",
                "subtitle": "Photography",
                "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
                "tags": "photography,nature",
                "sort_order": 5,
            },
        ],
    },
    {
        "title": "Our Team",
        "section_type": "team",
        "layout": "split",
        "description": "Meet the people behind the platform",
        "sort_order": 4,
        "is_visible": True,
        "status": "published",
        "max_items": 4,
        "contents": [
            {
                "title": "Alex Nguyen",
                "subtitle": "CEO & Founder",
                "body": "Visionary leader with 15+ years in the tech industry. Passionate about making technology accessible to everyone.",
                "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
                "sort_order": 0,
            },
            {
                "title": "Maria Tran",
                "subtitle": "CTO",
                "body": "Full-stack architect driving product innovation. Expert in scalable systems and cloud infrastructure.",
                "image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
                "sort_order": 1,
            },
            {
                "title": "David Le",
                "subtitle": "Head of Design",
                "body": "Award-winning designer crafting beautiful user experiences across all products.",
                "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
                "sort_order": 2,
            },
            {
                "title": "Sophie Pham",
                "subtitle": "Marketing Lead",
                "body": "Growth strategist with a track record of building brands and driving engagement.",
                "image_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
                "sort_order": 3,
            },
        ],
    },
    {
        "title": "Customer Testimonials",
        "section_type": "review",
        "layout": "carousel",
        "description": "What our customers say about us",
        "sort_order": 5,
        "is_visible": True,
        "status": "published",
        "max_items": 5,
        "contents": [
            {
                "title": "Game Changer for Our Business",
                "body": "Soppadop transformed how we manage our online presence. We went from spending hours on updates to minutes.",
                "author": "John Smith, CEO of TechCorp",
                "sort_order": 0,
            },
            {
                "title": "Best CMS We Have Used",
                "body": "After trying dozens of platforms, Soppadop is the only one that truly delivers on its promises. Highly recommended!",
                "author": "Emily Chen, Marketing Director",
                "sort_order": 1,
            },
            {
                "title": "Incredible Support Team",
                "body": "The support team went above and beyond to help us migrate our content. Could not be happier with the service.",
                "author": "Michael Brown, Founder",
                "sort_order": 2,
            },
            {
                "title": "Worth Every Penny",
                "body": "The ROI we have seen since switching to Soppadop is remarkable. Our content production has tripled.",
                "author": "Sarah Johnson, Content Manager",
                "sort_order": 3,
            },
            {
                "title": "Intuitive and Powerful",
                "body": "Even our non-technical team members can create beautiful pages. The learning curve is practically zero.",
                "author": "David Lee, Operations Lead",
                "sort_order": 4,
            },
        ],
    },
    {
        "title": "Pricing Plans",
        "section_type": "pricing",
        "layout": "grid",
        "description": "Choose the plan that fits your needs",
        "sort_order": 6,
        "is_visible": True,
        "status": "published",
        "max_items": 3,
        "contents": [
            {
                "title": "Starter",
                "subtitle": "Free forever",
                "body": "5 Pages, 1GB Storage, Basic Templates, Community Support, SSL Certificate",
                "tags": "free,starter",
                "sort_order": 0,
            },
            {
                "title": "Professional",
                "subtitle": "$29/month",
                "body": "Unlimited Pages, 50GB Storage, All Templates, Priority Support, Custom Domain, Analytics Dashboard",
                "tags": "pro,popular",
                "sort_order": 1,
            },
            {
                "title": "Enterprise",
                "subtitle": "$99/month",
                "body": "Everything in Pro, Unlimited Storage, Dedicated Manager, Custom Integrations, SLA Guarantee, White Label",
                "tags": "enterprise,custom",
                "sort_order": 2,
            },
        ],
    },
    {
        "title": "Frequently Asked Questions",
        "section_type": "faq",
        "layout": "stacked",
        "description": "Answers to common questions",
        "sort_order": 7,
        "is_visible": True,
        "status": "published",
        "max_items": 5,
        "contents": [
            {
                "title": "How do I get started?",
                "body": "Simply sign up for a free account, choose a template, and start building your page. Our onboarding wizard will guide you through the process.",
                "sort_order": 0,
            },
            {
                "title": "Can I use my own domain?",
                "body": "Yes! Professional and Enterprise plans support custom domains. You can connect your domain in just a few clicks from your dashboard settings.",
                "sort_order": 1,
            },
            {
                "title": "Is there a free trial?",
                "body": "Our Starter plan is free forever with no credit card required. You can upgrade anytime as your needs grow.",
                "sort_order": 2,
            },
            {
                "title": "Do you offer refunds?",
                "body": "Yes, we offer a 30-day money-back guarantee on all paid plans. If you are not satisfied, contact our support team for a full refund.",
                "sort_order": 3,
            },
            {
                "title": "Can I export my content?",
                "body": "Absolutely. You own your content and can export it at any time in multiple formats including JSON, HTML, and CSV.",
                "sort_order": 4,
            },
        ],
    },
    {
        "title": "Company Timeline",
        "section_type": "news",
        "layout": "timeline",
        "description": "Our journey so far",
        "sort_order": 8,
        "is_visible": True,
        "status": "published",
        "max_items": 5,
        "contents": [
            {
                "title": "Company Founded",
                "subtitle": "January 2020",
                "body": "Soppadop was born with a mission to democratize web content management.",
                "tags": "milestone,founding",
                "sort_order": 0,
            },
            {
                "title": "First 1,000 Users",
                "subtitle": "June 2020",
                "body": "Reached our first major milestone of 1,000 active users within 6 months of launch.",
                "tags": "milestone,growth",
                "sort_order": 1,
            },
            {
                "title": "Series A Funding",
                "subtitle": "March 2021",
                "body": "Raised $5M in Series A funding to expand our team and product capabilities.",
                "tags": "funding,growth",
                "sort_order": 2,
            },
            {
                "title": "10,000 Users Milestone",
                "subtitle": "December 2022",
                "body": "Crossed 10,000 active users and launched our Enterprise plan.",
                "tags": "milestone,enterprise",
                "sort_order": 3,
            },
            {
                "title": "Global Expansion",
                "subtitle": "2025",
                "body": "Expanded to 50+ countries with multi-language support and local payment methods.",
                "tags": "expansion,global",
                "sort_order": 4,
            },
        ],
    },
    {
        "title": "Upcoming Events",
        "section_type": "event",
        "layout": "list",
        "description": "Join us at these upcoming events",
        "sort_order": 9,
        "is_visible": True,
        "status": "published",
        "max_items": 3,
        "contents": [
            {
                "title": "Web Development Workshop",
                "subtitle": "April 20, 2026 - 2:00 PM",
                "body": "Hands-on workshop covering modern web development practices, hosted by our engineering team.",
                "author": "Engineering Team",
                "tags": "workshop,development",
                "sort_order": 0,
            },
            {
                "title": "Product Launch Webinar",
                "subtitle": "May 5, 2026 - 10:00 AM",
                "body": "Join us for the official launch of our new AI-powered content assistant feature.",
                "author": "Product Team",
                "tags": "launch,webinar",
                "sort_order": 1,
            },
            {
                "title": "Annual User Conference",
                "subtitle": "June 15-16, 2026",
                "body": "Two days of sessions, workshops, and networking with the Soppadop community.",
                "author": "Events Team",
                "tags": "conference,community",
                "sort_order": 2,
            },
        ],
    },
    {
        "title": "Video Showcase",
        "section_type": "video",
        "layout": "featured",
        "description": "Watch our product in action",
        "sort_order": 10,
        "is_visible": True,
        "status": "draft",
        "max_items": 2,
        "contents": [
            {
                "title": "Product Demo",
                "subtitle": "See Soppadop in action",
                "body": "A complete walkthrough of the platform features, from content creation to publishing.",
                "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "image_url": "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800",
                "sort_order": 0,
            },
            {
                "title": "Customer Success Story",
                "subtitle": "How TechCorp grew 300%",
                "body": "Learn how one of our customers achieved remarkable growth using Soppadop.",
                "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "image_url": "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800",
                "sort_order": 1,
            },
        ],
    },
    {
        "title": "Announcements",
        "section_type": "announcement",
        "layout": "tabs",
        "description": "Latest news and announcements",
        "sort_order": 11,
        "is_visible": True,
        "status": "draft",
        "max_items": 3,
        "contents": [
            {
                "title": "v3.0 Release Notes",
                "subtitle": "March 2026",
                "body": "New dashboard redesign, improved performance, and 50+ bug fixes. Upgrade today!",
                "tags": "release,update",
                "sort_order": 0,
            },
            {
                "title": "Scheduled Maintenance",
                "subtitle": "April 10, 2026",
                "body": "We will perform maintenance on April 10 from 2-4 AM UTC. Brief downtime expected.",
                "tags": "maintenance",
                "sort_order": 1,
            },
            {
                "title": "New Partner Program",
                "subtitle": "Now Open",
                "body": "Join our partner program and earn commissions by referring customers to Soppadop.",
                "tags": "partner,program",
                "link_url": "#partners",
                "sort_order": 2,
            },
        ],
    },
]


def seed_sample_sections():
    """Seed sample sections with content for demonstration."""
    daily_logger.debug("seed_sample_sections | START")

    owner = User.query.filter_by(is_owner=True).first()
    if not owner:
        daily_logger.warning(
            "seed_sample_sections | no owner found | skipping section seeding"
        )
        return

    existing_titles = {s.title for s in PageSection.query.all()}
    created_count = 0

    for sec_data in SAMPLE_SECTIONS:
        if sec_data["title"] in existing_titles:
            daily_logger.debug(
                f"seed_sample_sections | section already exists | title={sec_data['title']} | skipping"
            )
            continue

        section = PageSection(
            title=sec_data["title"],
            section_type=sec_data["section_type"],
            layout=sec_data["layout"],
            description=sec_data.get("description"),
            sort_order=sec_data.get("sort_order", 0),
            is_visible=sec_data.get("is_visible", True),
            status=sec_data.get("status", "draft"),
            max_items=sec_data.get("max_items", 6),
            background_color=sec_data.get("background_color"),
            created_by=owner.id,
        )
        db.session.add(section)
        db.session.flush()

        for c_data in sec_data.get("contents", []):
            content = SectionContent(
                section_id=section.id,
                title=c_data.get("title"),
                subtitle=c_data.get("subtitle"),
                body=c_data.get("body"),
                image_url=c_data.get("image_url"),
                video_url=c_data.get("video_url"),
                link_url=c_data.get("link_url"),
                tags=c_data.get("tags"),
                author=c_data.get("author"),
                sort_order=c_data.get("sort_order", 0),
            )
            db.session.add(content)

        created_count += 1
        daily_logger.debug(
            f"seed_sample_sections | created section | title={sec_data['title']} | layout={sec_data['layout']} | contents={len(sec_data.get('contents', []))}"
        )

    db.session.commit()
    daily_logger.info(
        f"seed_sample_sections | DONE | created={created_count} | skipped={len(SAMPLE_SECTIONS) - created_count}"
    )
