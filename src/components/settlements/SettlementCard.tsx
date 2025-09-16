import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settlement, User } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, ArrowRight } from 'lucide-react';

interface SettlementCardProps {
  settlement: Settlement;
  users: User[];
  currentUserId?: string;
  onApprove?: () => void;
  onReject?: () => void;
}

export function SettlementCard({ 
  settlement, 
  users, 
  currentUserId, 
  onApprove, 
  onReject 
}: SettlementCardProps) {
  const fromUser = users.find(u => u.id === settlement.from);
  const toUser = users.find(u => u.id === settlement.to);
  
  const canApprove = currentUserId === settlement.from || currentUserId === settlement.to;
  
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge className={statusColors[settlement.status]}>
            {settlement.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(settlement.createdAt, { addSuffix: true })}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {fromUser?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{fromUser?.name}</span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {toUser?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{toUser?.name}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-semibold text-lg">
              {settlement.currency} {settlement.amount.toFixed(2)}
            </div>
          </div>
        </div>
        
        {settlement.status === 'pending' && canApprove && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onReject}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button 
              size="sm" 
              onClick={onApprove}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        )}
        
        {settlement.completedAt && (
          <p className="text-sm text-muted-foreground mt-2">
            Completed {formatDistanceToNow(settlement.completedAt, { addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}