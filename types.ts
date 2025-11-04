
export enum Sender {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
}

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
}

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  messagesSentToday: number;
}
