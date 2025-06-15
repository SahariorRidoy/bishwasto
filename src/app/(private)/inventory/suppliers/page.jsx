import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManufacturersList } from "@/components/suppliers/manufacturers-list";
import { DistributorsList } from "@/components/suppliers/distributors-list";
import { SupplierStats } from "@/components/suppliers/supplier-stats";

export default function SupplierDashboard() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Supplier Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Manage your manufacturers and distributors
      </p>

      <SupplierStats />

      <Tabs defaultValue="distributors" className="mt-8">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="distributors">Distributors</TabsTrigger>
          <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
        </TabsList>
        <TabsContent value="distributors">
          <DistributorsList />
        </TabsContent>
        <TabsContent value="manufacturers">
          <ManufacturersList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
