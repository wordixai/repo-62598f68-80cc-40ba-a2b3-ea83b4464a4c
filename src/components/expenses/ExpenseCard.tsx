import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Expense, User } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Receipt, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ExpenseCardProps {
  expense: Expense;
  users: User[];
  currentUserId?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ExpenseCard({ expense, users, currentUserId, onEdit, onDelete }: ExpenseCardProps) {
  const paidByUser = users.find(u => u.id === expense.paidBy);
  const currentUserSplit = expense.splits.find(s => s.userId === currentUserId);
  
  const getCategoryClass = (categoryId: string) => {
    const categoryMap: Record<string, string> = {
      '1': 'category-food',
      '2': 'category-transport', 
      '3': 'category-entertainment',
      '4': 'category-shopping',
      '5': 'category-bills',
      '6': 'category-other'
    };
    return categoryMap[categoryId] || 'category-other';
  };

  return (
    <Card className="expense-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">{expense.title}</h3>
              {expense.receipt && (
                <Receipt className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            
            {expense.description && (
              <p className="text-sm text-muted-foreground mb-2">{expense.description}</p>
            )}
            
            <div className="flex items-center gap-2 mb-3">
              <Badge className={getCategoryClass(expense.category)}>
                {expense.category}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(expense.date, { addSuffix: true })}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {paidByUser?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  paid by {paidByUser?.name}
                </span>
              </div>
              
              <div className="text-right">
                <div className="font-semibold">
                  {expense.currency} {expense.amount.toFixed(2)}
                </div>
                {currentUserSplit && (
                  <div className="text-sm text-muted-foreground">
                    You owe: {expense.currency} {currentUserSplit.amount.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}