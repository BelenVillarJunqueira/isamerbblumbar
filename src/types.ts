export type PriorityLevel = 'inmediata' | 'hoy' | 'gestionado' | 'seguimiento';

export type TaskCategory = 'contacto' | 'stock' | 'cobro' | 'envio' | 'general';

export type BusinessId = 'bbimport' | 'lumbarfix';

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  businessId?: BusinessId;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCompany?: string;
  priority: PriorityLevel;
  category: TaskCategory;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  completed: boolean;
  completedAt?: string;
  source: string; // e.g., 'bbimport.onrender.com', 'lumbar-fix.vercel.app', 'whatsapp'
  notes?: string;
  reminderEnabled: boolean;
}

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  businessId: BusinessId;
  category: string;
  costPrice: number; // Costo de compra
  sellingPrice: number; // Precio de venta
  currentStock: number;
  minStockAlert: number;
  localId: string; // ID del canal/tienda ecommerce
  supplier?: string;
  imageUrl?: string;
}

export interface ComboComponent {
  productId: string;
  quantity: number; // Cuántas unidades de este producto lleva el combo
}

export interface ProductCombo {
  id: string;
  sku: string;
  name: string;
  businessId: BusinessId;
  description: string;
  components: ComboComponent[]; // Productos individuales que lo forman
  sellingPrice: number; // Precio promocional del combo
  manualStock?: number; // Stock físico pre-armado (opcional)
  localId: string;
  active: boolean;
}

export interface SaleItem {
  type: 'product' | 'combo';
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  subtotal: number;
  totalCost: number;
  profit: number;
}

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'mercadopago_qr' | 'contra_entrega' | 'otro';

export interface SaleTransaction {
  id: string;
  code: string; // e.g. #VTA-1042
  businessId?: BusinessId;
  date: string; // ISO string
  dayDate: string; // YYYY-MM-DD for grouping
  monthDate: string; // YYYY-MM for grouping
  clientId?: string;
  clientName: string;
  localId: string;
  localName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  totalCost: number;
  netProfit: number;
  marginPercent: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  source: string; // 'bbimport_web', 'lumbarfix_web', 'whatsapp', 'instagram'
}

export interface Client {
  id: string;
  name: string;
  businessId?: BusinessId;
  email: string;
  phone: string;
  company?: string;
  localId?: string;
  totalSpent: number;
  totalOrders: number;
  lastPurchaseDate?: string;
  tier: 'vip' | 'frecuente' | 'nuevo' | 'inactivo';
  notes?: string;
}

export interface StoreLocal {
  id: string;
  name: string;
  businessId: BusinessId;
  websiteUrl: string;
  platform: string;
  phone: string;
  carrierLogistics: string;
  manager: string;
  isOnlineStore: boolean;
}

export interface ClickChannel {
  id: string;
  name: string;
  businessId?: BusinessId;
  channel: 'bbimport_web' | 'lumbarfix_web' | 'whatsapp' | 'instagram' | 'google_ads' | 'facebook_ads' | 'direct';
  url: string;
  totalClicks: number;
  todayClicks: number;
  conversions: number; // Compras originadas
  conversionRate: number; // %
  lastClickAt: string;
}

export interface BusinessConfig {
  id: string;
  businessName: string;
  tagline: string;
  currencySymbol: string;
  currencyCode: string;
  taxRate: number;
  websiteUrl: string;
  secondaryWebsiteUrl?: string;
  enableStockAlerts: boolean;
  lowStockThresholdDefault: number;
  whiteLabelLicense: string;
}
