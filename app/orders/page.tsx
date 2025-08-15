import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { products as demoProducts } from "@/lib/dummy-data";
import Image from "next/image";
import { cn } from "@/lib/utils";

async function getUserOrders() {
  const session = await getServerSession(authOptions);

  // If not logged in, return demo purchases and sales so page is accessible (temporary access)
  if (!session?.user?.id) {
    const demoOrder = (idx: number) => {
      const p1 = demoProducts[(idx * 3) % demoProducts.length];
      const p2 = demoProducts[(idx * 3 + 1) % demoProducts.length];
      const items = [
        { id: `demo-item-${idx}-1`, quantity: 1 + (idx % 2), price: p1.price, product: { name: p1.name } },
        { id: `demo-item-${idx}-2`, quantity: 1, price: p2.price, product: { name: p2.name } },
      ];
      const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
      return {
        id: `demo-order-${idx}`,
        orderNumber: `DEMO-${1000 + idx}`,
        createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
        status: idx % 3 === 0 ? 'delivered' : idx % 3 === 1 ? 'processing' : 'shipped',
        items,
        totalAmount: total,
      } as any;
    };
    const purchases = [demoOrder(1), demoOrder(2), demoOrder(3)];
    const sales = [demoOrder(4), demoOrder(5)];
    return { purchases, sales };
  }

  const purchases = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const sales = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: { sellerId: session.user.id },
        },
      },
    },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { purchases, sales };
}

export default async function OrdersPage() {
  const { purchases, sales } = await getUserOrders();

  interface OrderItem { id: string; quantity: number; price: number; product: { name: string } }
  interface Order { id: string; orderNumber: string; createdAt: string; status: 'delivered' | 'processing' | 'shipped' | string; items: OrderItem[]; totalAmount: number }

  const statusToVariant = (status: string): React.ComponentProps<typeof Badge>["variant"] => {
    switch (status) {
      case 'delivered':
        return 'default'
      case 'processing':
        return 'secondary'
      case 'shipped':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const renderOrderCard = (order: Order) => {
    const firstItem: any = order.items?.[0]
    const thumb = firstItem?.product?.imageUrl || '/product-1.jpg'
    const numItems = order.items?.length || 0
    const date = new Date(order.createdAt).toLocaleString()
    return (
      <Link key={order.id} href={`/orders/tracking/${order.id}`} className="block">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted">
                  <Image src={thumb} alt="thumb" fill className="object-cover" placeholder="blur" blurDataURL="/placeholder.svg" />
                </div>
                <div>
                  <CardTitle className="text-base">{order.orderNumber}</CardTitle>
                  <CardDescription className="text-xs">{date}</CardDescription>
                </div>
              </div>
              <Badge className={cn("capitalize")}>{order.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {order.items.slice(0, 2).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-md overflow-hidden bg-muted">
                      <Image src={item?.product?.imageUrl || '/product-1.jpg'} alt="item" fill className="object-cover" placeholder="blur" blurDataURL="/placeholder.svg" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium line-clamp-1">{item.product.name}</div>
                      <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">₹{item.price}</div>
                </div>
              ))}
              {numItems > 2 && (
                <div className="text-xs text-muted-foreground">+{numItems - 2} more items</div>
              )}
              <div className="pt-2 border-t flex items-center justify-between text-sm">
                <div className="text-muted-foreground">Total Amount</div>
                <div className="font-semibold">₹{order.totalAmount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <Tabs defaultValue="all" className="w-full">
        <div className="sticky top-0 z-20 bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur -mx-4 px-4 pt-2">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">In Transit</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="all">
          <div className="space-y-4 mt-4">
            {purchases.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                    <Button asChild>
                      <Link href="/search">Start Shopping</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              purchases.map(renderOrderCard)
            )}
          </div>
        </TabsContent>

        <TabsContent value="processing">
          <div className="space-y-4 mt-4">
            {purchases.filter((o: any) => o.status === 'processing' || o.status === 'confirmed').map(renderOrderCard)}
          </div>
        </TabsContent>

        <TabsContent value="shipped">
          <div className="space-y-4 mt-4">
            {purchases.filter((o: any) => o.status === 'shipped').map(renderOrderCard)}
          </div>
        </TabsContent>

        <TabsContent value="delivered">
          <div className="space-y-4 mt-4">
            {purchases.filter((o: any) => o.status === 'delivered').map(renderOrderCard)}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Sales</h2>
        <div className="space-y-4">
          {sales && sales.length > 0 ? (
            sales.map(renderOrderCard)
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
                  <p className="text-muted-foreground mb-4">Orders placed on your listings will appear here.</p>
                  <Button asChild>
                    <Link href="/sell/dashboard">Go to Seller Center</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}