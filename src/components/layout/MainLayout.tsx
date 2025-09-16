import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Users, Receipt, BarChart3, Settings, Plus, CreditCard } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CreateGroupDialog } from '@/components/groups/CreateGroupDialog';
import { CreateExpenseDialog } from '@/components/expenses/CreateExpenseDialog';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { groups, selectedGroupId, setSelectedGroupId } = useStore();
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [createExpenseOpen, setCreateExpenseOpen] = useState(false);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b px-4 py-3">
            <h2 className="text-lg font-semibold text-sidebar-foreground">SplitWise</h2>
          </SidebarHeader>
          
          <SidebarContent className="px-2">
            <div className="space-y-2 py-2">
              <Button 
                onClick={() => setCreateGroupOpen(true)}
                className="w-full justify-start gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Create Group
              </Button>
              
              {selectedGroupId && (
                <Button 
                  onClick={() => setCreateExpenseOpen(true)}
                  variant="outline"
                  className="w-full justify-start gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              )}
            </div>

            <div className="space-y-4 py-4">
              <div>
                <h3 className="mb-2 px-2 text-sm font-medium text-sidebar-foreground/70">
                  Groups
                </h3>
                <SidebarMenu>
                  {groups.map((group) => (
                    <SidebarMenuItem key={group.id}>
                      <SidebarMenuButton
                        isActive={selectedGroupId === group.id}
                        onClick={() => setSelectedGroupId(group.id)}
                        className="w-full justify-start"
                      >
                        <Users className="h-4 w-4" />
                        <span className="truncate">{group.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>

              {selectedGroup && (
                <div>
                  <h3 className="mb-2 px-2 text-sm font-medium text-sidebar-foreground/70">
                    {selectedGroup.name}
                  </h3>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Receipt className="h-4 w-4" />
                        Expenses
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <BarChart3 className="h-4 w-4" />
                        Balances
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <CreditCard className="h-4 w-4" />
                        Settlements
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Settings className="h-4 w-4" />
                        Settings
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </div>
              )}
            </div>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <div className="flex-1">
              {selectedGroup && (
                <div>
                  <h1 className="text-xl font-semibold">{selectedGroup.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {selectedGroup.members.length} members
                  </p>
                </div>
              )}
            </div>
          </header>
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>

      <CreateGroupDialog open={createGroupOpen} onOpenChange={setCreateGroupOpen} />
      <CreateExpenseDialog open={createExpenseOpen} onOpenChange={setCreateExpenseOpen} />
    </SidebarProvider>
  );
}