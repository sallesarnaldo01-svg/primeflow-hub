export const CHANNELS = {
  WHATSAPP: 'whatsapp',
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  EMAIL: 'email',
  WEBCHAT: 'webchat',
} as const;

export type ChannelType = typeof CHANNELS[keyof typeof CHANNELS];

export const CHANNEL_LABELS: Record<ChannelType, string> = {
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  instagram: 'Instagram',
  email: 'E-mail',
  webchat: 'WebChat',
};

export const CHANNEL_COLORS: Record<ChannelType, string> = {
  whatsapp: 'hsl(142 76% 36%)',
  facebook: 'hsl(221 44% 41%)',
  instagram: 'hsl(340 75% 50%)',
  email: 'hsl(234 89% 74%)',
  webchat: 'hsl(269 97% 85%)',
};
