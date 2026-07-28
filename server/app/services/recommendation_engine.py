import json
from app import db
from app.models.service import Service
from app.models.review import Review
from app.models.booking import Booking


class RecommendationEngine:
    TAMIL_NADU_CITIES = [
        "chennai",
        "coimbatore",
        "madurai",
        "trichy",
        "salem",
        "tirunelveli",
        "vellore",
        "erode",
        "thanjavur",
        "dindigul",
        "tiruppur",
        "karur",
        "namakkal",
        "perambalur",
        "ariyalur",
        "cuddalore",
        "nagapattinam",
        "thiruvarur",
        "kanchipuram",
        "tiruvallur",
        "kanyakumari",
        "thoothukudi",
        "virudhunagar",
        "ramanathapuram",
        "pudukkottai",
        "sivaganga",
        "theni",
        "dharmapuri",
        "krishnagiri",
        "viluppuram",
    ]

    INTENT_KEYWORDS = {
        "chef_recommendation": [
            "chef",
            "cook",
            "cooking",
            "food",
            "biryani",
            "catering",
        ],
        "caterer_recommendation": [
            "caterer",
            "catering service",
            "food service",
            "bulk food",
        ],
        "decorator_recommendation": [
            "decorator",
            "decoration",
            "venue setup",
            "stage",
            "flower",
        ],
        "booking_help": ["book", "booking", "reserve", "how to book", "how do i book"],
        "faq_pricing": ["price", "cost", "rate", "how much", "charges", "fees"],
        "faq_payment": ["payment", "pay", "online payment", "cash payment"],
        "faq_cancellation": ["cancel", "cancellation", "refund", "cancel booking"],
        "similar": ["similar", "like", "same as", "compare", "alternative"],
        "greeting": ["hi", "hello", "hey", "good morning", "good evening"],
        "thanks": ["thank", "thanks", "thank you", "appreciate"],
        "help": ["help", "assist", "support", "guide"],
    }

    EVENT_KEYWORDS = {
        "wedding": ["wedding", "marriage", "reception", "muhurtham", "kalyanam"],
        "birthday": ["birthday", "bday", "party"],
        "corporate": ["corporate", "office", "business", "company", "meeting"],
        "housewarming": ["housewarming", "griha pravesh", "new house"],
        "anniversary": ["anniversary", "celebration"],
        "engagement": ["engagement", "nischayam", "betrothal"],
    }

    CUISINE_KEYWORDS = {
        "chettinad": ["chettinad", "chettinadu", "karaikudi"],
        "tamil": ["tamil", "south indian", "madras"],
        "north indian": ["north indian", "punjabi", "tandoori"],
        "chinese": ["chinese", "indo-chinese", "manchurian"],
        "biryani": ["biryani", "briyani", "dum biryani"],
        "vegetarian": ["veg", "vegetarian", "pure veg"],
        "non-vegetarian": ["non-veg", "non vegetarian", "chicken", "mutton"],
    }

    FAQ_RESPONSES = {
        "faq_pricing": "Pricing varies based on the service type and provider. Chefs typically charge Rs.5,000-25,000 per event, caterers Rs.300-800 per plate, and decorators Rs.10,000-1,00,000 depending on the setup. Would you like me to find providers within your budget?",
        "faq_payment": "You have two payment options:\n\nOnline Payment - Pay securely through our platform after booking confirmation\nCash Payment - Pay the provider directly in person\n\nBoth methods are safe and tracked in your booking history.",
        "faq_cancellation": "You can cancel a booking if it's in 'pending' or 'confirmed' status. Go to your Bookings page, select the booking, and click 'Cancel Booking'. The provider will be notified automatically.",
        "booking_help": "Here's how to book:\n\n1. Browse services (Chefs, Caterers, Decorators)\n2. Select a provider and check availability\n3. Fill in event details and submit request\n4. Wait for provider confirmation\n5. Make payment (online or cash)\n\nWould you like me to recommend some providers?",
    }

    def __init__(self):
        pass

    def detect_intent(self, message):
        message_lower = message.lower()
        detected_intents = []

        for intent, keywords in self.INTENT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in message_lower:
                    detected_intents.append(intent)
                    break

        return detected_intents if detected_intents else ["unknown"]

    def extract_location(self, message):
        message_lower = message.lower()
        for city in self.TAMIL_NADU_CITIES:
            if city in message_lower:
                return city.capitalize()
        return None

    def extract_event_type(self, message):
        message_lower = message.lower()
        for event_type, keywords in self.EVENT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in message_lower:
                    return event_type
        return None

    def extract_cuisine(self, message):
        message_lower = message.lower()
        for cuisine, keywords in self.CUISINE_KEYWORDS.items():
            for keyword in keywords:
                if keyword in message_lower:
                    return cuisine
        return None

    def extract_budget(self, message):
        import re

        numbers = re.findall(r"\d+", message)
        if numbers:
            return int(numbers[0])
        return None

    def get_service_type(self, intents):
        if "chef_recommendation" in intents:
            return "chef"
        elif "caterer_recommendation" in intents:
            return "caterer"
        elif "decorator_recommendation" in intents:
            return "decorator"
        return None

    def calculate_score(self, service, location=None, budget=None):
        score = 0

        # Rating score (40% weight)
        rating_score = (service.rating or 0) * 8  # Max 40 points
        score += rating_score

        # Review count score (20% weight)
        review_count = service.total_reviews or 0
        review_score = min(review_count / 5, 20)  # Max 20 points
        score += review_score

        # Location match (10% weight)
        if location and service.city:
            city_name = (
                service.city.name
                if hasattr(service.city, "name")
                else str(service.city)
            )
            if location.lower() in city_name.lower():
                score += 10

        # Price match (10% weight)
        if budget and service.price_per_event:
            if service.price_per_event <= budget:
                score += 10
            elif service.price_per_event <= budget * 1.2:
                score += 5

        # Verification bonus (10% weight)
        if service.is_verified:
            score += 10

        # Active status bonus (10% weight)
        if service.is_active:
            score += 10

        return score

    def get_recommendations(self, message, user_context=None):
        intents = self.detect_intent(message)
        location = self.extract_location(message)
        event_type = self.extract_event_type(message)
        cuisine = self.extract_cuisine(message)
        budget = self.extract_budget(message)
        service_type = self.get_service_type(intents)

        # Handle greetings
        if "greeting" in intents:
            return {
                "message": "Hello! I'm Cheffy, your personal booking assistant. I can help you find the best chefs, caterers, and decorators in Tamil Nadu. What are you looking for today?",
                "recommendations": None,
            }

        # Handle thanks
        if "thanks" in intents:
            return {
                "message": "You're welcome! If you need any more help, just ask. Happy booking!",
                "recommendations": None,
            }

        # Handle help
        if "help" in intents:
            return {
                "message": "I can help you with:\n\n- Find best-rated chefs, caterers, decorators\n- Recommend providers for your event type\n- Answer questions about pricing and booking\n- Guide you through the booking process\n- Show similar providers to compare\n\nWhat would you like to know?",
                "recommendations": None,
            }

        # Handle FAQs
        for intent in intents:
            if intent in self.FAQ_RESPONSES:
                return {"message": self.FAQ_RESPONSES[intent], "recommendations": None}

        # Get service recommendations
        if service_type:
            query = Service.query.filter(
                Service.service_type == service_type, Service.is_active == True
            )

            # Filter by location if specified
            if location:
                from app.models.location import City

                city = City.query.filter(City.name.ilike(f"%{location}%")).first()
                if city:
                    query = query.filter(Service.city_id == city.id)

            services = query.all()

            # Calculate scores and sort
            scored_services = []
            for service in services:
                score = self.calculate_score(service, location, budget)
                scored_services.append((service, score))

            scored_services.sort(key=lambda x: x[1], reverse=True)
            top_services = scored_services[:5]

            if top_services:
                recommendations = []
                for service, score in top_services:
                    recommendations.append(
                        {
                            "id": service.id,
                            "title": service.title,
                            "provider_name": service.user.full_name
                            if service.user
                            else "Unknown",
                            "rating": service.rating,
                            "total_reviews": service.total_reviews,
                            "service_type": service.service_type,
                            "cuisine_types": service.get_cuisine_types()
                            if hasattr(service, "get_cuisine_types")
                            else [],
                            "price_per_event": service.price_per_event,
                            "city": service.city.name if service.city else None,
                            "is_verified": service.is_verified,
                        }
                    )

                response_message = (
                    f"Based on ratings and reviews, here are the top {service_type}s"
                )
                if location:
                    response_message += f" in {location}"
                response_message += ":\n\n"

                for i, rec in enumerate(recommendations[:3], 1):
                    verified_badge = " [Verified]" if rec["is_verified"] else ""
                    response_message += (
                        f"{i}. {rec['rating']}/5 - {rec['title']}{verified_badge}\n"
                    )
                    response_message += (
                        f"   {rec['provider_name']} - {rec['total_reviews']} reviews\n"
                    )
                    if rec["price_per_event"]:
                        response_message += (
                            f"   Rs.{rec['price_per_event']:,} per event\n"
                        )

                response_message += "\nWould you like more details about any of them?"

                return {"message": response_message, "recommendations": recommendations}
            else:
                return {
                    "message": f"I couldn't find any {service_type}s"
                    + (f" in {location}" if location else "")
                    + ". Try searching in a different city or with different criteria.",
                    "recommendations": None,
                }

        # Unknown intent
        return {
            "message": "I'm not sure I understand. Could you tell me more about what you're looking for? For example:\n\n• 'I need a chef for wedding in Chennai'\n• 'Best caterers in Madurai'\n• 'How do I make payment?'",
            "recommendations": None,
        }

    def get_similar_providers(self, service_id):
        service = Service.query.get(service_id)
        if not service:
            return {
                "message": "I couldn't find that provider. Please try again.",
                "recommendations": None,
            }

        similar = (
            Service.query.filter(
                Service.service_type == service.service_type,
                Service.is_active == True,
                Service.id != service_id,
            )
            .limit(5)
            .all()
        )

        if similar:
            recommendations = []
            for s in similar:
                recommendations.append(
                    {
                        "id": s.id,
                        "title": s.title,
                        "provider_name": s.user.full_name if s.user else "Unknown",
                        "rating": s.rating,
                        "total_reviews": s.total_reviews,
                        "service_type": s.service_type,
                        "price_per_event": s.price_per_event,
                        "city": s.city.name if s.city else None,
                    }
                )

            return {
                "message": f"Here are providers similar to {service.title}:\n\n"
                + "\n".join(
                    [
                        f"• {r['rating']}/5 {r['title']} by {r['provider_name']}"
                        for r in recommendations[:3]
                    ]
                ),
                "recommendations": recommendations,
            }

        return {
            "message": "I couldn't find similar providers at the moment.",
            "recommendations": None,
        }
