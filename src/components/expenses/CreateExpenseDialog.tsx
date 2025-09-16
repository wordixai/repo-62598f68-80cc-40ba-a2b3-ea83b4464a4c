import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/hooks/useStore';
import { Expense, ExpenseSplit, SplitMethod } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { calculateEqualSplit, calculatePercentageSplit, calculateTaxAndTipDistribution } from '@/utils/calculations';
import { Receipt, Camera, Calculator } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateExpenseDialog({ open, onOpenChange }: CreateExpenseDialogProps) {
  const { currentUser, groups, selectedGroupId, categories, addExpense } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [percentageSplits, setPercentageSplits] = useState<Record<string, string>>({});

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  useEffect(() => {
    if (selectedGroup && currentUser) {
      setPaidBy(currentUser.id);
      setSelectedParticipants(selectedGroup.members.map(m => m.id));
    }
  }, [selectedGroup, currentUser]);

  const calculateSplits = (): ExpenseSplit[] => {
    if (!selectedGroup) return [];
    
    const totalAmount = parseFloat(amount) || 0;
    const taxAmount = parseFloat(tax) || 0;
    const tipAmount = parseFloat(tip) || 0;
    const baseAmount = totalAmount - taxAmount - tipAmount;
    
    let baseSplits: ExpenseSplit[] = [];
    
    switch (splitMethod) {
      case 'equal':
        const equalSplits = calculateEqualSplit(baseAmount, selectedParticipants.length);
        baseSplits = selectedParticipants.map((userId, index) => ({
          ...equalSplits[index],
          userId
        }));
        break;
        
      case 'percentage':
        const percentages = selectedParticipants.map(userId => ({
          userId,
          percentage: parseFloat(percentageSplits[userId]) || 0
        }));
        baseSplits = calculatePercentageSplit(baseAmount, percentages);
        break;
        
      case 'custom':
        baseSplits = selectedParticipants.map(userId => ({
          userId,
          amount: parseFloat(customSplits[userId]) || 0
        }));
        break;
        
      default:
        baseSplits = [];
    }
    
    // Distribute tax and tip proportionally
    if (taxAmount > 0 || tipAmount > 0) {
      return calculateTaxAndTipDistribution(baseSplits, taxAmount, tipAmount);
    }
    
    return baseSplits;
  };

  const splits = calculateSplits();
  const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
  const totalAmount = parseFloat(amount) || 0;
  const isValidSplit = Math.abs(totalSplit - totalAmount) < 0.01;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || !selectedGroupId || !currentUser || !isValidSplit) return;

    const expense: Expense = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      amount: parseFloat(amount),
      currency: selectedGroup?.currency || 'USD',
      category,
      groupId: selectedGroupId,
      paidBy,
      splitMethod,
      splits,
      tax: parseFloat(tax) || undefined,
      tip: parseFloat(tip) || undefined,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    addExpense(expense);
    
    // Reset form
    setTitle('');
    setDescription('');
    setAmount('');
    setCategory('');
    setTax('');
    setTip('');
    setCustomSplits({});
    setPercentageSplits({});
    onOpenChange(false);
  };

  const handleParticipantToggle = (userId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (!selectedGroup) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Group Selected</DialogTitle>
          </DialogHeader>
          <p>Please select a group first to add an expense.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Dinner at Restaurant"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this expense..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="paidBy">Paid By</Label>
              <Select value={paidBy} onValueChange={setPaidBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedGroup.members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tax">Tax (Optional)</Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="tip">Tip (Optional)</Label>
              <Input
                id="tip"
                type="number"
                step="0.01"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label>Split Method</Label>
            <Tabs value={splitMethod} onValueChange={(value) => setSplitMethod(value as SplitMethod)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="equal">Equal</TabsTrigger>
                <TabsTrigger value="percentage">Percentage</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
              
              <TabsContent value="equal" className="space-y-3">
                <p className="text-sm text-muted-foreground">Split equally among selected participants</p>
                <div className="space-y-2">
                  {selectedGroup.members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={member.id}
                        checked={selectedParticipants.includes(member.id)}
                        onCheckedChange={() => handleParticipantToggle(member.id)}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                      </div>
                      {selectedParticipants.includes(member.id) && (
                        <Badge variant="outline" className="text-xs">
                          ${(splits.find(s => s.userId === member.id)?.amount || 0).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="percentage" className="space-y-3">
                <p className="text-sm text-muted-foreground">Split by percentage</p>
                <div className="space-y-2">
                  {selectedParticipants.map((userId) => {
                    const member = selectedGroup.members.find(m => m.id === userId);
                    if (!member) return null;
                    
                    return (
                      <div key={userId} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm flex-1">{member.name}</span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={percentageSplits[userId] || ''}
                          onChange={(e) => setPercentageSplits(prev => ({
                            ...prev,
                            [userId]: e.target.value
                          }))}
                          className="w-20"
                        />
                        <span className="text-sm">%</span>
                        <Badge variant="outline" className="text-xs">
                          ${(splits.find(s => s.userId === userId)?.amount || 0).toFixed(2)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-3">
                <p className="text-sm text-muted-foreground">Enter custom amounts</p>
                <div className="space-y-2">
                  {selectedParticipants.map((userId) => {
                    const member = selectedGroup.members.find(m => m.id === userId);
                    if (!member) return null;
                    
                    return (
                      <div key={userId} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm flex-1">{member.name}</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={customSplits[userId] || ''}
                          onChange={(e) => setCustomSplits(prev => ({
                            ...prev,
                            [userId]: e.target.value
                          }))}
                          className="w-24"
                        />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {totalAmount > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex justify-between text-sm">
                <span>Total Amount:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Split:</span>
                <span className={isValidSplit ? 'text-green-600' : 'text-red-600'}>
                  ${totalSplit.toFixed(2)}
                </span>
              </div>
              {!isValidSplit && (
                <p className="text-xs text-red-600 mt-1">
                  Split amounts don't match the total amount
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !amount || !isValidSplit} className="flex-1">
              Add Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}