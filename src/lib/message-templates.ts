export type MessageTemplate = {
  label: string;
  text: string;
};

export const LANDLORD_TEMPLATES: MessageTemplate[] = [
  {
    label: "Viewing confirmed",
    text: "Thank you for your interest! I've confirmed your viewing for {date}. Please arrive on time.",
  },
  {
    label: "Property still available",
    text: "Yes, the property is still available. When would you like to schedule a viewing?",
  },
  {
    label: "Request documents",
    text: "To proceed, I'll need to verify your identity. Please complete your profile verification on SafeRent.",
  },
  {
    label: "Viewing reminder",
    text: "Just a reminder about your viewing scheduled for tomorrow. Looking forward to meeting you!",
  },
];
