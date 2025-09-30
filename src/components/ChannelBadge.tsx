import { Badge } from '@/components/ui/badge';
import { MessageCircle, Facebook, Instagram, Mail, MessageSquare } from 'lucide-react';
import { ChannelType } from '@/constants/channels';

interface ChannelBadgeProps {
  channel: ChannelType;
  className?: string;
}

export function ChannelBadge({ channel, className }: ChannelBadgeProps) {
  const getChannelIcon = () => {
    switch (channel) {
      case 'whatsapp':
        return <MessageCircle className="w-3 h-3" />;
      case 'facebook':
        return <Facebook className="w-3 h-3" />;
      case 'instagram':
        return <Instagram className="w-3 h-3" />;
      case 'email':
        return <Mail className="w-3 h-3" />;
      case 'webchat':
        return <MessageSquare className="w-3 h-3" />;
      default:
        return <MessageSquare className="w-3 h-3" />;
    }
  };

  const getChannelColor = () => {
    switch (channel) {
      case 'whatsapp':
        return 'bg-success/10 text-success hover:bg-success/20';
      case 'facebook':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'instagram':
        return 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20';
      case 'email':
        return 'bg-primary/10 text-primary hover:bg-primary/20';
      case 'webchat':
        return 'bg-accent/10 text-accent-foreground hover:bg-accent/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Badge variant="outline" className={`${getChannelColor()} ${className}`}>
      {getChannelIcon()}
      <span className="ml-1 capitalize">{channel}</span>
    </Badge>
  );
}
