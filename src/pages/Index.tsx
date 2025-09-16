import { MainLayout } from '@/components/layout/MainLayout';
import { useStore } from '@/hooks/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { BalanceCard } from '@/components/balances/BalanceCard';
import { SettlementCard } from '@/components/settlements/SettlementCard';
import { calculateGroupBalances, optimizeSettlements } from '@/utils/calculations';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Receipt, BarChart3, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { useState } from 'react';

const Index = () => {
  const { 
    groups, 
    expenses, 
    settlements, 
    currentUser, 
    selectedGroupId, 
    categories,
    addSettlement,
    updateSettlement 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState('expenses');
  
  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const groupExpenses = expenses.filter(e => e.groupId === selectedGroupId);
  const groupSettlements = settlements.filter(s => s.groupId === selectedGroupId);
  
  const balances = selectedGroup ? calculateGroupBalances(groupExpenses, selectedGroup.members) : [];
  const suggestedSettlements = selectedGroup ? optimizeSettlements(balances) : [];
  
  const totalGroupExpenses = groupExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const userBalance = balances.find(b => b.userId === currentUser?.id);
  
  if (!selectedGroup) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Welcome to SplitWise</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create a group or select an existing one to start tracking shared expenses 
            and managing settlements with your friends.
          </p>
          <Button>Create Your First Group</Button>
        </div>
      </MainLayout>
    );
  }

  const handleCreateSettlement = (creditorId: string, amount: number) => {
    if (!currentUser || !selectedGroupId) return;
    
    const settlement = {
      id: `settlement-${Date.now()}`,
      groupId: selectedGroupId,
      from: currentUser.id,
      to: creditorId,
      amount,
      currency: selectedGroup.currency,
      status: 'pending' as const,
      createdAt: new Date()
    };
    
    addSettlement(settlement);
  };

  const handleApproveSettlement = (settlementId: string) => {
    updateSettlement(settlementId, {
      status: 'completed',
      completedAt: new Date()
    });
  };

  const handleRejectSettlement = (settlementId: string) => {
    updateSettlement(settlementId, {
      status: 'cancelled'
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedGroup.currency} {totalGroupExpenses.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {groupExpenses.length} expense{groupExpenses.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                userBalance?.balance && userBalance.balance > 0 
                  ? 'text-green-600' 
                  : userBalance?.balance && userBalance.balance < 0 
                    ? 'text-red-600' 
                    : 'text-muted-foreground'
              }`}>
                {userBalance?.balance 
                  ? `${userBalance.balance > 0 ? '+' : ''}${selectedGroup.currency} ${Math.abs(userBalance.balance).toFixed(2)}`
                  : `${selectedGroup.currency} 0.00`
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {userBalance?.balance 
                  ? userBalance.balance > 0 
                    ? 'You are owed'
                    : userBalance.balance < 0 
                      ? 'You owe'
                      : 'Settled up'
                  : 'No expenses yet'
                }
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Group Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedGroup.members.length}</div>
              <p className="text-xs text-muted-foreground">
                Active members
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Settlements</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {groupSettlements.filter(s => s.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="balances" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Balances
            </TabsTrigger>
            <TabsTrigger value="settlements" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Settlements
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Expenses</h2>
              <Badge variant="outline">{groupExpenses.length} total</Badge>
            </div>
            
            {groupExpenses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No expenses yet</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Start by adding your first expense to begin tracking shared costs with your group.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {groupExpenses
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      users={selectedGroup.members}
                      currentUserId={currentUser?.id}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="balances" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Group Balances</h2>
              {suggestedSettlements.length > 0 && (
                <Badge variant="outline">
                  {suggestedSettlements.length} suggested settlement{suggestedSettlements.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            <div className="grid gap-4">
              {balances.map((balance) => {
                const user = selectedGroup.members.find(m => m.id === balance.userId);
                if (!user) return null;
                
                return (
                  <BalanceCard
                    key={balance.userId}
                    balance={balance}
                    user={user}
                    currency={selectedGroup.currency}
                    onSettle={handleCreateSettlement}
                  />
                );
              })}
            </div>
            
            {suggestedSettlements.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Suggested Settlements</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These are the optimal settlements to minimize the number of transactions needed.
                </p>
                <div className="space-y-3">
                  {suggestedSettlements.map((settlement, index) => {
                    const fromUser = selectedGroup.members.find(m => m.id === settlement.from);
                    const toUser = selectedGroup.members.find(m => m.id === settlement.to);
                    
                    return (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{fromUser?.name}</span>
                              <span className="text-muted-foreground">pays</span>
                              <span className="font-medium">{toUser?.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">
                                {selectedGroup.currency} {settlement.amount.toFixed(2)}
                              </span>
                              <Button
                                size="sm"
                                onClick={() => handleCreateSettlement(settlement.to, settlement.amount)}
                                disabled={settlement.from !== currentUser?.id}
                              >
                                Create Settlement
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settlements" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Settlements</h2>
              <Badge variant="outline">
                {groupSettlements.filter(s => s.status === 'pending').length} pending
              </Badge>
            </div>
            
            {groupSettlements.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No settlements yet</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Settlements will appear here when group members need to pay each other back.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {groupSettlements
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((settlement) => (
                    <SettlementCard
                      key={settlement.id}
                      settlement={settlement}
                      users={selectedGroup.members}
                      currentUserId={currentUser?.id}
                      onApprove={() => handleApproveSettlement(settlement.id)}
                      onReject={() => handleRejectSettlement(settlement.id)}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Index;