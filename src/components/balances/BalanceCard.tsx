import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GroupBalance, User } from '@/types';
import { ArrowRight } from 'lucide-react';

interface BalanceCardProps {
  balance: GroupBalance;
  user: User;
  currency: string;
  onSettle?: (creditorId: string, amount: number) => void;
}

export function BalanceCard({ balance, user, currency, onSettle }: BalanceCardProps) {
  const isPositive = balance.balance > 0;
  const isZero = Math.abs(balance.balance) < 0.01;
  
  const balanceClass = isZero 
    ? 'balance-zero' 
    : isPositive 
      ? 'balance-positive' 
      : 'balance-negative';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-lg font-semibold ${balanceClass}`}>
              {isPositive ? '+' : ''}{currency} {Math.abs(balance.balance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isZero ? 'Settled up' : isPositive ? 'Gets back' : 'Owes'}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {balance.owes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Owes:</h4>
            {balance.owes.map((debt) => {
              const creditor = user; // This would need to be looked up from a users array
              return (
                <div key={debt.userId} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded-md">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        ?
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Someone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">
                      {currency} {debt.amount.toFixed(2)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSettle?.(debt.userId, debt.amount)}
                    >
                      Settle
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {balance.owedBy.length > 0 && (
          <div className="space-y-2 mt-3">
            <h4 className="text-sm font-medium text-muted-foreground">Owed by:</h4>
            {balance.owedBy.map((credit) => (
              <div key={credit.userId} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded-md">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      ?
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Someone</span>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {currency} {credit.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}