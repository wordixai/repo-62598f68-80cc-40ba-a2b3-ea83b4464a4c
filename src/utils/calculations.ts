import { Expense, ExpenseSplit, GroupBalance, User, Settlement } from '@/types';

export function calculateGroupBalances(
  expenses: Expense[], 
  users: User[]
): GroupBalance[] {
  const balances: Record<string, GroupBalance> = {};
  
  // Initialize balances
  users.forEach(user => {
    balances[user.id] = {
      userId: user.id,
      balance: 0,
      owes: [],
      owedBy: []
    };
  });

  // Calculate balances from expenses
  expenses.forEach(expense => {
    const paidBy = expense.paidBy;
    const totalAmount = expense.amount + (expense.tax || 0) + (expense.tip || 0);
    
    // Add amount paid to payer's balance
    balances[paidBy].balance += totalAmount;
    
    // Subtract each person's share
    expense.splits.forEach(split => {
      balances[split.userId].balance -= split.amount;
      
      if (split.userId !== paidBy) {
        // Update owes/owedBy relationships
        const existingOwe = balances[split.userId].owes.find(o => o.userId === paidBy);
        if (existingOwe) {
          existingOwe.amount += split.amount;
        } else {
          balances[split.userId].owes.push({ userId: paidBy, amount: split.amount });
        }
        
        const existingOwed = balances[paidBy].owedBy.find(o => o.userId === split.userId);
        if (existingOwed) {
          existingOwed.amount += split.amount;
        } else {
          balances[paidBy].owedBy.push({ userId: split.userId, amount: split.amount });
        }
      }
    });
  });

  return Object.values(balances);
}

export function optimizeSettlements(balances: GroupBalance[]): Settlement[] {
  const settlements: Settlement[] = [];
  const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
  const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
  
  let i = 0, j = 0;
  
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    
    const settleAmount = Math.min(creditor.balance, Math.abs(debtor.balance));
    
    if (settleAmount > 0.01) { // Ignore very small amounts
      settlements.push({
        id: `settlement-${settlements.length + 1}`,
        groupId: '', // Will be set by caller
        from: debtor.userId,
        to: creditor.userId,
        amount: settleAmount,
        currency: 'USD',
        status: 'pending',
        createdAt: new Date()
      });
    }
    
    creditor.balance -= settleAmount;
    debtor.balance += settleAmount;
    
    if (creditor.balance < 0.01) i++;
    if (Math.abs(debtor.balance) < 0.01) j++;
  }
  
  return settlements;
}

export function calculateEqualSplit(amount: number, participantCount: number): ExpenseSplit[] {
  const splitAmount = Math.round((amount / participantCount) * 100) / 100;
  const remainder = Math.round((amount - (splitAmount * participantCount)) * 100) / 100;
  
  const splits: ExpenseSplit[] = [];
  for (let i = 0; i < participantCount; i++) {
    splits.push({
      userId: '', // Will be set by caller
      amount: i === 0 ? splitAmount + remainder : splitAmount
    });
  }
  
  return splits;
}

export function calculatePercentageSplit(
  amount: number, 
  percentages: { userId: string; percentage: number }[]
): ExpenseSplit[] {
  return percentages.map(({ userId, percentage }) => ({
    userId,
    amount: Math.round((amount * percentage / 100) * 100) / 100,
    percentage
  }));
}

export function calculateTaxAndTipDistribution(
  baseSplits: ExpenseSplit[],
  tax: number = 0,
  tip: number = 0
): ExpenseSplit[] {
  const totalBase = baseSplits.reduce((sum, split) => sum + split.amount, 0);
  const totalExtra = tax + tip;
  
  return baseSplits.map(split => ({
    ...split,
    amount: split.amount + Math.round((split.amount / totalBase * totalExtra) * 100) / 100
  }));
}