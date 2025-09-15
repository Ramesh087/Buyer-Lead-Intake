// app/buyers/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
// import { getServerSession } from "@/lib/getServerSession"; // custom helper
import { authOptions,getServerSession } from "@/lib/auth";
import { getBuyer, getBuyerHistory } from "@/lib/db/queries";
import { BuyerForm } from "@/components/buyers/buyer-form";
import { BuyerHistory } from "@/components/buyers/buyer-history";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: "user" | "admin";
};

type Session = {
  user: AuthUser;
  expires: string;
};

export default async function BuyerDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // Get server session
  const session = await getServerSession() as Session | null;

  if (!session?.user) redirect("/");

  // Fetch buyer
  const buyer = await getBuyer(params.id);
  if (!buyer) notFound();

  const canEdit = buyer.ownerId === session.user.id || session.user.role === "admin";

  const history = await getBuyerHistory(params.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/buyers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{buyer.fullName}</h1>
          <p className="text-muted-foreground">Lead details and history</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {canEdit ? (
              <BuyerForm buyer={buyer} userId={session.user.id} isEditing />
            ) : (
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Lead Information</h3>
                  <div className="text-sm text-muted-foreground">
                    Read-only (Owner: {buyer.owner?.name || buyer.owner?.email})
                  </div>
                </div>
                <BuyerForm buyer={buyer} userId={session.user.id} isEditing readOnly />
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <BuyerHistory history={history} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
