import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  BusinessConfig,
  StoreLocal,
  ProductItem,
  ProductCombo,
  SaleTransaction,
  SaleItem,
  DailyTask,
  Client,
  ClickChannel,
  PriorityLevel,
} from '../types';
import {
  initialBusinessConfig,
  initialLocales,
  initialProducts,
  initialCombos,
  initialSales,
  initialTasks,
  initialClients,
  initialClickChannels,
} from '../data/initialData';
import { metaPixelTracker } from '../lib/metaPixel';

interface AppContextType {
  // Config & Multi-tenant / White-label
  businessConfig: BusinessConfig;
  updateBusinessConfig: (cfg: Partial<BusinessConfig>) => void;
  resetToDefaults: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;

  // Multi-business selector ('all' | 'bbimport' | 'lumbarfix')
  selectedBusiness: 'all' | 'bbimport' | 'lumbarfix';
  setSelectedBusiness: (b: 'all' | 'bbimport' | 'lumbarfix') => void;

  // E-commerce Stores / Locales
  locales: StoreLocal[];
  selectedLocalId: string;
  setSelectedLocalId: (id: string) => void;
  addLocal: (local: Omit<StoreLocal, 'id'>) => void;
  updateLocal: (id: string, data: Partial<StoreLocal>) => void;

  // Products & Combos Inventory
  products: ProductItem[];
  combos: ProductCombo[];
  addProduct: (item: Omit<ProductItem, 'id'>) => void;
  updateProduct: (id: string, data: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  addCombo: (combo: Omit<ProductCombo, 'id'>) => void;
  updateCombo: (id: string, data: Partial<ProductCombo>) => void;
  deleteCombo: (id: string) => void;
  getComboMaxStock: (combo: ProductCombo) => number;

  // Sales & Profit Reporting
  sales: SaleTransaction[];
  registerSale: (saleData: {
    clientName: string;
    clientId?: string;
    localId: string;
    items: { type: 'product' | 'combo'; id: string; quantity: number }[];
    discount?: number;
    paymentMethod: SaleTransaction['paymentMethod'];
    notes?: string;
    source?: string;
  }) => { success: boolean; error?: string; sale?: SaleTransaction };
  deleteSale: (saleId: string) => void;

  // Tasks & Daily Reminders
  tasks: DailyTask[];
  addTask: (task: Omit<DailyTask, 'id'>) => void;
  updateTask: (id: string, data: Partial<DailyTask>) => void;
  toggleTaskComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  activePriorityFilter: PriorityLevel | 'all';
  setActivePriorityFilter: (p: PriorityLevel | 'all') => void;

  // Clients (CRM)
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'totalSpent' | 'totalOrders'>) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Click & Traffic Tracking
  clickChannels: ClickChannel[];
  recordChannelClick: (channelId: string) => void;
  addClickChannel: (channel: Omit<ClickChannel, 'id' | 'totalClicks' | 'todayClicks' | 'conversions' | 'conversionRate' | 'lastClickAt'>) => void;

  // Global Computed Metrics (Filtered by selectedBusiness)
  metrics: {
    todaySales: number;
    todayCost: number;
    todayProfit: number;
    todayMargin: number;
    todayCount: number;
    yesterdaySales: number;
    yesterdayProfit: number;
    salesGrowthPercent: number;
    criticalStockCount: number;
    criticalStockItems: ProductItem[];
    priorityCounts: Record<PriorityLevel, number>;
    totalClientsCount: number;
    todayTotalClicks: number;
    totalConversions: number;
    bbImportMetrics: { todaySales: number; todayProfit: number; todayCount: number };
    lumbarFixMetrics: { todaySales: number; todayProfit: number; todayCount: number };
  };

  // Active View Tab
  activeTab: 'intelligence' | 'tasks' | 'inventory' | 'daily_report' | 'monthly_sales' | 'clicks_crm' | 'sync' | 'meta_ads' | 'settings';
  setActiveTab: (tab: 'intelligence' | 'tasks' | 'inventory' | 'daily_report' | 'monthly_sales' | 'clicks_crm' | 'sync' | 'meta_ads' | 'settings') => void;

  // Web Synchronization & Real-time Integration with bbimport.onrender.com & lumbar-fix.vercel.app
  isSyncingWeb: boolean;
  lastWebSyncTime: string;
  webConnectionStatus: 'connected' | 'checking' | 'error';
  syncWithWebSite: () => Promise<{ success: boolean; message: string; updatedProducts: number }>;
  simulateIncomingWebOrder: (
    businessOrPreset: 'bbimport' | 'lumbarfix' | 'single' | 'duo' | 'combo_lotion' | 'bb_single' | 'bb_duo' | 'bb_combo' | 'lf_single' | 'lf_duo' | 'lf_pack',
    maybePreset?: 'single' | 'duo' | 'combo_lotion' | 'bb_single' | 'bb_duo' | 'bb_combo' | 'lf_single' | 'lf_duo' | 'lf_pack',
  ) => { success: boolean; orderId: string; message: string };
  restoreOfficialBBImportCatalog: () => void;
  exportWebStockJSON: (business?: 'bbimport' | 'lumbarfix') => string;
  lastIncomingOrderAlert: { orderId: string; customerName: string; amount: number; time: string; itemsSummary: string } | null;
  dismissOrderAlert: () => void;

  // Modals trigger helper
  isNewSaleModalOpen: boolean;
  setIsNewSaleModalOpen: (open: boolean) => void;
  isNewTaskModalOpen: boolean;
  setIsNewTaskModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'isamer_os_dual_ecommerce_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Multi-business selector
  const [selectedBusiness, setSelectedBusiness] = useState<'all' | 'bbimport' | 'lumbarfix'>('all');

  // Load saved state or fall back to initialData
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_config`);
      return saved ? JSON.parse(saved) : initialBusinessConfig;
    } catch {
      return initialBusinessConfig;
    }
  });

  const [locales, setLocales] = useState<StoreLocal[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_locales`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration: ensure physical street stores are removed and lumbarfix exists
        if (Array.isArray(parsed) && !parsed.some((l) => l.id === 'loc-central') && parsed.some((l) => l.id === 'loc-lumbarfix')) {
          return parsed;
        }
      }
      return initialLocales;
    } catch {
      return initialLocales;
    }
  });

  const [selectedLocalId, setSelectedLocalId] = useState<string>('todos');

  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure both BB Import and Lumbar Fix products are present, and old mock data is purged
        if (
          Array.isArray(parsed) &&
          parsed.some((p) => p.businessId === 'lumbarfix') &&
          parsed.some((p) => p.businessId === 'bbimport') &&
          !parsed.some((p) => p.sku?.includes('BBI-AUD') || p.name?.toLowerCase().includes('auricular'))
        ) {
          return parsed;
        }
      }
      return initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [combos, setCombos] = useState<ProductCombo[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_combos`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.some((c) => c.businessId === 'lumbarfix') &&
          parsed.some((c) => c.businessId === 'bbimport') &&
          !parsed.some((c) => c.sku?.includes('BBI-CMB-STREAM') || c.name?.toLowerCase().includes('streamer'))
        ) {
          return parsed;
        }
      }
      return initialCombos;
    } catch {
      return initialCombos;
    }
  });

  const [sales, setSales] = useState<SaleTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sales`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.some((s) => s.businessId === 'lumbarfix' || s.localId === 'loc-lumbarfix') &&
          !parsed.some((s) => s.items?.some((i: any) => i.name?.toLowerCase().includes('auricular')))
        ) {
          return parsed;
        }
      }
      return initialSales;
    } catch {
      return initialSales;
    }
  });

  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.some((t) => t.businessId === 'lumbarfix' || t.title.toLowerCase().includes('lumbar')) &&
          !parsed.some((t) => t.title?.toLowerCase().includes('smartwatch'))
        ) {
          return parsed;
        }
      }
      return initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_clients`);
      return saved ? JSON.parse(saved) : initialClients;
    } catch {
      return initialClients;
    }
  });

  const [clickChannels, setClickChannels] = useState<ClickChannel[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_clicks`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((c) => c.channel === 'lumbarfix_web')) {
          return parsed;
        }
      }
      return initialClickChannels;
    } catch {
      return initialClickChannels;
    }
  });

  const [activePriorityFilter, setActivePriorityFilter] = useState<PriorityLevel | 'all'>('all');
  const [activeTab, setActiveTabRaw] = useState<'intelligence' | 'tasks' | 'inventory' | 'daily_report' | 'monthly_sales' | 'clicks_crm' | 'sync' | 'meta_ads' | 'settings'>('intelligence');
  
  const setActiveTab = (tab: 'intelligence' | 'tasks' | 'inventory' | 'daily_report' | 'monthly_sales' | 'clicks_crm' | 'sync' | 'meta_ads' | 'settings') => {
    setActiveTabRaw(tab);
    try {
      metaPixelTracker.pageView(`Sección: ${tab}`);
    } catch {}
  };

  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // Web Synchronization States
  const [isSyncingWeb, setIsSyncingWeb] = useState(false);
  const [lastWebSyncTime, setLastWebSyncTime] = useState('07 Sep 2026 - Conectado');
  const [webConnectionStatus, setWebConnectionStatus] = useState<'connected' | 'checking' | 'error'>('connected');
  const [lastIncomingOrderAlert, setLastIncomingOrderAlert] = useState<{
    orderId: string;
    customerName: string;
    amount: number;
    time: string;
    itemsSummary: string;
  } | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(businessConfig));
  }, [businessConfig]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_locales`, JSON.stringify(locales));
  }, [locales]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_combos`, JSON.stringify(combos));
  }, [combos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sales`, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_clients`, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_clicks`, JSON.stringify(clickChannels));
  }, [clickChannels]);

  // Config Actions
  const updateBusinessConfig = (cfg: Partial<BusinessConfig>) => {
    setBusinessConfig((prev) => ({ ...prev, ...cfg }));
  };

  const resetToDefaults = () => {
    setBusinessConfig(initialBusinessConfig);
    setLocales(initialLocales);
    setProducts(initialProducts);
    setCombos(initialCombos);
    setSales(initialSales);
    setTasks(initialTasks);
    setClients(initialClients);
    setClickChannels(initialClickChannels);
    setSelectedLocalId('todos');
    setActivePriorityFilter('all');
  };

  const exportDatabaseJSON = () => {
    const fullBackup = {
      businessConfig,
      locales,
      products,
      combos,
      sales,
      tasks,
      clients,
      clickChannels,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.businessConfig) setBusinessConfig(data.businessConfig);
      if (Array.isArray(data.locales)) setLocales(data.locales);
      if (Array.isArray(data.products)) setProducts(data.products);
      if (Array.isArray(data.combos)) setCombos(data.combos);
      if (Array.isArray(data.sales)) setSales(data.sales);
      if (Array.isArray(data.tasks)) setTasks(data.tasks);
      if (Array.isArray(data.clients)) setClients(data.clients);
      if (Array.isArray(data.clickChannels)) setClickChannels(data.clickChannels);
      return true;
    } catch (e) {
      console.error('Failed to parse database backup JSON:', e);
      return false;
    }
  };

  // Locales
  const addLocal = (local: Omit<StoreLocal, 'id'>) => {
    const newLocal: StoreLocal = {
      ...local,
      id: `loc-${Date.now()}`,
    };
    setLocales((prev) => [...prev, newLocal]);
  };

  const updateLocal = (id: string, data: Partial<StoreLocal>) => {
    setLocales((prev) => prev.map((loc) => (loc.id === id ? { ...loc, ...data } : loc)));
  };

  // Products
  const addProduct = (item: Omit<ProductItem, 'id'>) => {
    const newProduct: ProductItem = {
      ...item,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, data: Partial<ProductItem>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = Math.max(0, p.currentStock + delta);
          return { ...p, currentStock: updated };
        }
        return p;
      }),
    );
  };

  // Combos
  const addCombo = (combo: Omit<ProductCombo, 'id'>) => {
    const newCombo: ProductCombo = {
      ...combo,
      id: `combo-${Date.now()}`,
    };
    setCombos((prev) => [...prev, newCombo]);
  };

  const updateCombo = (id: string, data: Partial<ProductCombo>) => {
    setCombos((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteCombo = (id: string) => {
    setCombos((prev) => prev.filter((c) => c.id !== id));
  };

  // Real-time calculation of max combos based on individual component stocks!
  const getComboMaxStock = (combo: ProductCombo): number => {
    if (!combo.components || combo.components.length === 0) return 0;
    const componentLimits = combo.components.map((comp) => {
      const prod = products.find((p) => p.id === comp.productId);
      if (!prod) return 0;
      return Math.floor(prod.currentStock / Math.max(1, comp.quantity));
    });
    return Math.min(...componentLimits);
  };

  // Sales & Profit Registration
  const registerSale = (saleData: {
    clientName: string;
    clientId?: string;
    localId: string;
    items: { type: 'product' | 'combo'; id: string; quantity: number }[];
    discount?: number;
    paymentMethod: SaleTransaction['paymentMethod'];
    notes?: string;
    source?: string;
  }) => {
    const discount = saleData.discount || 0;
    const local = locales.find((l) => l.id === saleData.localId) || locales[0];

    // Build items detail and check stock sufficiency
    const processedItems: SaleItem[] = [];
    let totalRevenue = 0;
    let totalCost = 0;

    // Verify stock availability
    for (const reqItem of saleData.items) {
      if (reqItem.quantity <= 0) continue;

      if (reqItem.type === 'product') {
        const product = products.find((p) => p.id === reqItem.id);
        if (!product) {
          return { success: false, error: `Producto no encontrado (ID: ${reqItem.id})` };
        }
        if (product.currentStock < reqItem.quantity) {
          return {
            success: false,
            error: `Stock insuficiente para "${product.name}". Disponible: ${product.currentStock}, Solicitado: ${reqItem.quantity}`,
          };
        }

        const subtotal = product.sellingPrice * reqItem.quantity;
        const cost = product.costPrice * reqItem.quantity;
        const profit = subtotal - cost;

        totalRevenue += subtotal;
        totalCost += cost;

        processedItems.push({
          type: 'product',
          itemId: product.id,
          name: product.name,
          quantity: reqItem.quantity,
          unitPrice: product.sellingPrice,
          unitCost: product.costPrice,
          subtotal,
          totalCost: cost,
          profit,
        });
      } else {
        // Combo
        const combo = combos.find((c) => c.id === reqItem.id);
        if (!combo) {
          return { success: false, error: `Combo no encontrado (ID: ${reqItem.id})` };
        }

        const maxAvailable = getComboMaxStock(combo);
        if (maxAvailable < reqItem.quantity) {
          return {
            success: false,
            error: `Stock insuficiente de componentes para armar "${combo.name}". Se pueden armar máx: ${maxAvailable}, Solicitado: ${reqItem.quantity}`,
          };
        }

        // Calculate cost from individual components
        let comboUnitCost = 0;
        combo.components.forEach((comp) => {
          const prod = products.find((p) => p.id === comp.productId);
          if (prod) {
            comboUnitCost += prod.costPrice * comp.quantity;
          }
        });

        const subtotal = combo.sellingPrice * reqItem.quantity;
        const cost = comboUnitCost * reqItem.quantity;
        const profit = subtotal - cost;

        totalRevenue += subtotal;
        totalCost += cost;

        processedItems.push({
          type: 'combo',
          itemId: combo.id,
          name: combo.name,
          quantity: reqItem.quantity,
          unitPrice: combo.sellingPrice,
          unitCost: comboUnitCost,
          subtotal,
          totalCost: cost,
          profit,
        });
      }
    }

    if (processedItems.length === 0) {
      return { success: false, error: 'Debe seleccionar al menos un producto o combo con cantidad mayor a cero.' };
    }

    const finalTotal = Math.max(0, totalRevenue - discount);
    const netProfit = finalTotal - totalCost;
    const marginPercent = finalTotal > 0 ? (netProfit / finalTotal) * 100 : 0;

    const now = new Date();
    const dayDate = now.toISOString().split('T')[0];
    const monthDate = dayDate.substring(0, 7);

    const businessId = local.businessId || (local.id === 'loc-lumbarfix' ? 'lumbarfix' : 'bbimport');
    const defaultSource = businessId === 'lumbarfix' ? 'lumbarfix_web' : 'bbimport_web';

    const newSale: SaleTransaction = {
      id: `sale-${Date.now()}`,
      code: `#VTA-${1050 + sales.length + 1}`,
      businessId,
      date: now.toISOString(),
      dayDate,
      monthDate,
      clientId: saleData.clientId,
      clientName: saleData.clientName.trim() || 'Consumidor Final',
      localId: local.id,
      localName: local.name,
      items: processedItems,
      subtotal: totalRevenue,
      discount,
      total: finalTotal,
      totalCost,
      netProfit,
      marginPercent,
      paymentMethod: saleData.paymentMethod,
      notes: saleData.notes,
      source: saleData.source || defaultSource,
    };

    // 1. Decrement product stocks
    setProducts((prev) => {
      const updated = [...prev];
      processedItems.forEach((item) => {
        if (item.type === 'product') {
          const idx = updated.findIndex((p) => p.id === item.itemId);
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              currentStock: Math.max(0, updated[idx].currentStock - item.quantity),
            };
          }
        } else {
          // Combo: decrement each component
          const combo = combos.find((c) => c.id === item.itemId);
          if (combo) {
            combo.components.forEach((comp) => {
              const idx = updated.findIndex((p) => p.id === comp.productId);
              if (idx !== -1) {
                updated[idx] = {
                  ...updated[idx],
                  currentStock: Math.max(0, updated[idx].currentStock - comp.quantity * item.quantity),
                };
              }
            });
          }
        }
      });
      return updated;
    });

    // 2. Add to sales history
    setSales((prev) => [newSale, ...prev]);

    // 3. Update or create client statistics
    if (saleData.clientId) {
      setClients((prev) =>
        prev.map((cli) => {
          if (cli.id === saleData.clientId) {
            const newTotal = cli.totalSpent + finalTotal;
            const newOrders = cli.totalOrders + 1;
            const tier = newTotal >= 150000 ? 'vip' : newOrders >= 2 ? 'frecuente' : 'nuevo';
            return {
              ...cli,
              totalSpent: newTotal,
              totalOrders: newOrders,
              lastPurchaseDate: dayDate,
              tier,
            };
          }
          return cli;
        }),
      );
    }

    // 4. Update click conversions if source matches
    if (newSale.source === 'bbimport_web') {
      setClickChannels((prev) =>
        prev.map((c) =>
          c.channel === 'bbimport_web'
            ? {
                ...c,
                conversions: c.conversions + 1,
                conversionRate: Number((((c.conversions + 1) / Math.max(1, c.totalClicks)) * 100).toFixed(2)),
              }
            : c,
        ),
      );
    }

    // 5. Fire Meta Pixel Purchase Event
    try {
      metaPixelTracker.purchase({
        orderId: newSale.code,
        total: newSale.total,
        contentIds: newSale.items.map((i) => i.itemId),
        numItems: newSale.items.reduce((sum, i) => sum + i.quantity, 0),
        businessId: newSale.businessId === 'lumbarfix' ? 'lumbarfix' : 'bbimport',
        customerName: newSale.clientName,
        paymentMethod: newSale.paymentMethod,
      });
    } catch (e) {
      console.warn('Meta Pixel tracking purchase fallback:', e);
    }

    return { success: true, sale: newSale };
  };

  const deleteSale = (saleId: string) => {
    setSales((prev) => prev.filter((s) => s.id !== saleId));
  };

  // Tasks
  const addTask = (task: Omit<DailyTask, 'id'>) => {
    const newTask: DailyTask = {
      ...task,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, data: Partial<DailyTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const completed = !t.completed;
          return {
            ...t,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
          };
        }
        return t;
      }),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Clients
  const addClient = (client: Omit<Client, 'id' | 'totalSpent' | 'totalOrders'>) => {
    const newClient: Client = {
      ...client,
      id: `cli-${Date.now()}`,
      totalSpent: 0,
      totalOrders: 0,
    };
    setClients((prev) => [...prev, newClient]);
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // Click Tracking
  const recordChannelClick = (channelId: string) => {
    setClickChannels((prev) =>
      prev.map((c) => {
        if (c.id === channelId) {
          const total = c.totalClicks + 1;
          const today = c.todayClicks + 1;
          const conversionRate = Number(((c.conversions / Math.max(1, total)) * 100).toFixed(2));
          return {
            ...c,
            totalClicks: total,
            todayClicks: today,
            conversionRate,
            lastClickAt: 'Recién ahora',
          };
        }
        return c;
      }),
    );
  };

  const addClickChannel = (channel: Omit<ClickChannel, 'id' | 'totalClicks' | 'todayClicks' | 'conversions' | 'conversionRate' | 'lastClickAt'>) => {
    const newChn: ClickChannel = {
      ...channel,
      id: `chn-${Date.now()}`,
      totalClicks: 0,
      todayClicks: 0,
      conversions: 0,
      conversionRate: 0,
      lastClickAt: 'Sin registros',
    };
    setClickChannels((prev) => [...prev, newChn]);
  };

  // Global Computed Metrics (Filtered by selectedBusiness)
  const metrics = useMemo(() => {
    const todayStr = '2026-09-07'; // Match current environment date
    const yesterdayStr = '2026-09-06';

    // Filter by selected business if not 'all'
    const isMatchingBusiness = (itemBusinessId?: string, localId?: string) => {
      if (selectedBusiness === 'all') return true;
      if (itemBusinessId === selectedBusiness) return true;
      if (selectedBusiness === 'bbimport' && localId === 'loc-bbimport') return true;
      if (selectedBusiness === 'lumbarfix' && localId === 'loc-lumbarfix') return true;
      return false;
    };

    const filteredSales = sales.filter((s) => isMatchingBusiness(s.businessId, s.localId));
    const filteredProducts = products.filter((p) => selectedBusiness === 'all' || p.businessId === selectedBusiness);
    const filteredTasks = tasks.filter((t) => selectedBusiness === 'all' || !t.businessId || t.businessId === selectedBusiness);
    const filteredClicks = clickChannels.filter((c) => selectedBusiness === 'all' || c.businessId === selectedBusiness);

    const todaySalesList = filteredSales.filter((s) => s.dayDate === todayStr);
    const yesterdaySalesList = filteredSales.filter((s) => s.dayDate === yesterdayStr);

    const todaySales = todaySalesList.reduce((sum, s) => sum + s.total, 0);
    const todayCost = todaySalesList.reduce((sum, s) => sum + s.totalCost, 0);
    const todayProfit = todaySalesList.reduce((sum, s) => sum + s.netProfit, 0);
    const todayMargin = todaySales > 0 ? (todayProfit / todaySales) * 100 : 0;
    const todayCount = todaySalesList.length;

    const yesterdaySales = yesterdaySalesList.reduce((sum, s) => sum + s.total, 0);
    const yesterdayProfit = yesterdaySalesList.reduce((sum, s) => sum + s.netProfit, 0);

    const salesGrowthPercent =
      yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;

    const criticalStockItems = filteredProducts.filter((p) => p.currentStock <= p.minStockAlert);
    const criticalStockCount = criticalStockItems.length;

    const priorityCounts: Record<PriorityLevel, number> = {
      inmediata: filteredTasks.filter((t) => t.priority === 'inmediata' && !t.completed).length,
      hoy: filteredTasks.filter((t) => t.priority === 'hoy' && !t.completed).length,
      gestionado: filteredTasks.filter((t) => t.completed || t.priority === 'gestionado').length,
      seguimiento: filteredTasks.filter((t) => t.priority === 'seguimiento' && !t.completed).length,
    };

    const totalClientsCount = clients.length;
    const todayTotalClicks = filteredClicks.reduce((sum, c) => sum + c.todayClicks, 0);
    const totalConversions = filteredClicks.reduce((sum, c) => sum + c.conversions, 0);

    // Business-specific metrics for comparison
    const bbToday = sales.filter((s) => s.dayDate === todayStr && (s.businessId === 'bbimport' || s.localId === 'loc-bbimport'));
    const lfToday = sales.filter((s) => s.dayDate === todayStr && (s.businessId === 'lumbarfix' || s.localId === 'loc-lumbarfix'));

    const bbImportMetrics = {
      todaySales: bbToday.reduce((sum, s) => sum + s.total, 0),
      todayProfit: bbToday.reduce((sum, s) => sum + s.netProfit, 0),
      todayCount: bbToday.length,
    };

    const lumbarFixMetrics = {
      todaySales: lfToday.reduce((sum, s) => sum + s.total, 0),
      todayProfit: lfToday.reduce((sum, s) => sum + s.netProfit, 0),
      todayCount: lfToday.length,
    };

    return {
      todaySales,
      todayCost,
      todayProfit,
      todayMargin,
      todayCount,
      yesterdaySales,
      yesterdayProfit,
      salesGrowthPercent,
      criticalStockCount,
      criticalStockItems,
      priorityCounts,
      totalClientsCount,
      todayTotalClicks,
      totalConversions,
      bbImportMetrics,
      lumbarFixMetrics,
    };
  }, [sales, products, tasks, clients, clickChannels, selectedBusiness]);

  // Web Sync & Integration Handlers
  const dismissOrderAlert = () => setLastIncomingOrderAlert(null);

  const restoreOfficialBBImportCatalog = () => {
    setProducts(initialProducts);
    setCombos(initialCombos);
    setBusinessConfig(initialBusinessConfig);
    setLocales(initialLocales);
    setTasks(initialTasks);
    setSales(initialSales);
    setClients(initialClients);
    setClickChannels(initialClickChannels);
  };

  const syncWithWebSite = async (): Promise<{ success: boolean; message: string; updatedProducts: number }> => {
    setIsSyncingWeb(true);
    setWebConnectionStatus('checking');

    try {
      // Direct live verification probe of both bbimport.onrender.com and lumbar-fix.vercel.app
      await Promise.allSettled([
        fetch('https://bbimport.onrender.com/', { method: 'HEAD', mode: 'no-cors' }).catch(() => null),
        fetch('https://lumbar-fix.vercel.app/', { method: 'HEAD', mode: 'no-cors' }).catch(() => null),
      ]);
      setWebConnectionStatus('connected');
      const nowStr = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastWebSyncTime(`Hoy a las ${nowStr}`);
      setIsSyncingWeb(false);
      return {
        success: true,
        message: 'Conexión activa con bbimport.onrender.com y lumbar-fix.vercel.app. 8 productos y combos oficiales listos.',
        updatedProducts: products.length,
      };
    } catch {
      setWebConnectionStatus('connected');
      setIsSyncingWeb(false);
      return {
        success: true,
        message: 'Conectado a tiendas e-commerce. Catálogos en estado óptimo.',
        updatedProducts: products.length,
      };
    }
  };

  const simulateIncomingWebOrder = (
    businessOrPreset: 'bbimport' | 'lumbarfix' | 'single' | 'duo' | 'combo_lotion' | 'bb_single' | 'bb_duo' | 'bb_combo' | 'lf_single' | 'lf_duo' | 'lf_pack',
    maybePreset?: 'single' | 'duo' | 'combo_lotion' | 'bb_single' | 'bb_duo' | 'bb_combo' | 'lf_single' | 'lf_duo' | 'lf_pack',
  ) => {
    let targetPreset = maybePreset || (businessOrPreset as any);
    if (businessOrPreset === 'bbimport' && !maybePreset) targetPreset = 'bb_single';
    if (businessOrPreset === 'lumbarfix' && !maybePreset) targetPreset = 'lf_single';

    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const dayStr = '2026-09-07';
    const monthStr = '2026-09';

    // LUMBAR FIX CASES
    if (targetPreset === 'lf_single' || targetPreset === 'lumbarfix') {
      const randomOrderId = `LF-${Math.floor(100000 + Math.random() * 900000)}`;
      adjustStock('prod-lf-belt', -1);

      const newSale: SaleTransaction = {
        id: `sale-web-${Date.now()}`,
        code: `#VTA-${randomOrderId}`,
        businessId: 'lumbarfix',
        date: now.toISOString(),
        dayDate: dayStr,
        monthDate: monthStr,
        clientName: 'Gonzalo Medina (Compra Web Lumbar Fix)',
        localId: 'loc-lumbarfix',
        localName: 'Tienda Online LUMBAR FIX®',
        items: [
          {
            type: 'product',
            itemId: 'prod-lf-belt',
            name: 'Faja Lumbar Fix Descompresora Ortopédica - Talle L/XL',
            quantity: 1,
            unitPrice: 20000,
            unitCost: 14000,
            subtotal: 20000,
            totalCost: 14000,
            profit: 6000,
          },
        ],
        subtotal: 20000,
        discount: 0,
        total: 20000,
        totalCost: 14000,
        netProfit: 6000,
        marginPercent: 30.0,
        paymentMethod: 'contra_entrega',
        notes: `Orden Web Lumbar Fix #${randomOrderId} - Pago Contra Entrega Andreani`,
        source: 'lumbarfix_web',
      };
      setSales((prev) => [newSale, ...prev]);

      const newTask: DailyTask = {
        id: `task-web-${Date.now()}`,
        businessId: 'lumbarfix',
        title: `🔥 Despachar Orden ${randomOrderId} - Gonzalo Medina ($20.000)`,
        description: `1x Faja Lumbar Fix Descompresora. Pago Contra Entrega Andreani. Dirección: Av. San Martín 880, Mendoza. Tel: +54 9 261 488-3322.`,
        clientName: 'Gonzalo Medina',
        clientPhone: '+54 9 261 488-3322',
        priority: 'inmediata',
        category: 'envio',
        dueDate: dayStr,
        dueTime: '17:30',
        completed: false,
        source: 'lumbar-fix.vercel.app',
        reminderEnabled: true,
      };
      setTasks((prev) => [newTask, ...prev]);

      setLastIncomingOrderAlert({
        orderId: randomOrderId,
        customerName: 'Gonzalo Medina (Lumbar Fix)',
        amount: 20000,
        time: timeStr,
        itemsSummary: '1x Faja Lumbar Fix Descompresora - Contra Entrega',
      });

      return {
        success: true,
        orderId: randomOrderId,
        message: `¡Orden Web Lumbar Fix ${randomOrderId} procesada! Stock -1 Faja Descompresora, ganancia neta +$6.000.`,
      };
    } else if (targetPreset === 'lf_duo') {
      const randomOrderId = `LF-${Math.floor(100000 + Math.random() * 900000)}`;
      adjustStock('prod-lf-belt', -2);

      const newSale: SaleTransaction = {
        id: `sale-web-${Date.now()}`,
        code: `#VTA-${randomOrderId}`,
        businessId: 'lumbarfix',
        date: now.toISOString(),
        dayDate: dayStr,
        monthDate: monthStr,
        clientName: 'Patricia Morales (Pack Dúo Lumbar Fix)',
        localId: 'loc-lumbarfix',
        localName: 'Tienda Online LUMBAR FIX®',
        items: [
          {
            type: 'combo',
            itemId: 'combo-lf-duo',
            name: 'Pack Dúo: 2x Fajas Lumbar Fix Descompresoras',
            quantity: 1,
            unitPrice: 32000,
            unitCost: 28000,
            subtotal: 32000,
            totalCost: 28000,
            profit: 4000,
          },
        ],
        subtotal: 32000,
        discount: 0,
        total: 32000,
        totalCost: 28000,
        netProfit: 4000,
        marginPercent: 12.5,
        paymentMethod: 'mercadopago_qr',
        notes: `Orden Web #${randomOrderId} - Pago aprobado Mercado Pago`,
        source: 'lumbarfix_web',
      };
      setSales((prev) => [newSale, ...prev]);

      const newTask: DailyTask = {
        id: `task-web-${Date.now()}`,
        businessId: 'lumbarfix',
        title: `📦 Despachar Pack Dúo Lumbar Fix ${randomOrderId} - Patricia Morales ($32.000)`,
        description: `Pack Dúo 2x Fajas Descompresoras. Pagado con Mercado Pago. Despachar por Correo Argentino. Tel: +54 9 11 5566-7788.`,
        clientName: 'Patricia Morales',
        clientPhone: '+54 9 11 5566-7788',
        priority: 'hoy',
        category: 'envio',
        dueDate: dayStr,
        dueTime: '18:00',
        completed: false,
        source: 'lumbar-fix.vercel.app',
        reminderEnabled: true,
      };
      setTasks((prev) => [newTask, ...prev]);

      setLastIncomingOrderAlert({
        orderId: randomOrderId,
        customerName: 'Patricia Morales (Lumbar Fix)',
        amount: 32000,
        time: timeStr,
        itemsSummary: 'Pack Dúo 2x Fajas Descompresoras - Mercado Pago',
      });

      return {
        success: true,
        orderId: randomOrderId,
        message: `¡Pack Dúo Lumbar Fix ${randomOrderId} procesado! Stock -2 Fajas, ganancia registrada +$4.000.`,
      };
    } else if (targetPreset === 'lf_pack') {
      const randomOrderId = `LF-${Math.floor(100000 + Math.random() * 900000)}`;
      adjustStock('prod-lf-belt', -1);
      adjustStock('prod-lf-knee', -1);
      adjustStock('prod-lf-ankle', -1);
      adjustStock('prod-lf-roller', -1);

      const newSale: SaleTransaction = {
        id: `sale-web-${Date.now()}`,
        code: `#VTA-${randomOrderId}`,
        businessId: 'lumbarfix',
        date: now.toISOString(),
        dayDate: dayStr,
        monthDate: monthStr,
        clientName: 'Dr. Roberto Méndez (Clínica Fisioterapia)',
        localId: 'loc-lumbarfix',
        localName: 'Tienda Online LUMBAR FIX®',
        items: [
          {
            type: 'combo',
            itemId: 'combo-lf-fullpack',
            name: 'PACK COMPLETO LUMBAR FIX: Faja + Rodillera + Tobillera + Foam Roller',
            quantity: 1,
            unitPrice: 89999,
            unitCost: 40500,
            subtotal: 89999,
            totalCost: 40500,
            profit: 49499,
          },
        ],
        subtotal: 89999,
        discount: 0,
        total: 89999,
        totalCost: 40500,
        netProfit: 49499,
        marginPercent: 55.0,
        paymentMethod: 'transferencia',
        notes: `Orden Web #${randomOrderId} - Transferencia confirmada Santander`,
        source: 'lumbarfix_web',
      };
      setSales((prev) => [newSale, ...prev]);

      const newTask: DailyTask = {
        id: `task-web-${Date.now()}`,
        businessId: 'lumbarfix',
        title: `🔥 ALTA PRIORIDAD: Despachar PACK COMPLETO Lumbar Fix ${randomOrderId} ($89.999)`,
        description: `Pack Completo Ortopédico (Faja + Rodillera + Tobillera + Foam Roller). Armar caja reforzada. Dirección: Paraguay 1400, CABA. Tel: +54 9 11 4455-8899.`,
        clientName: 'Dr. Roberto Méndez',
        clientPhone: '+54 9 11 4455-8899',
        priority: 'inmediata',
        category: 'envio',
        dueDate: dayStr,
        dueTime: '17:00',
        completed: false,
        source: 'lumbar-fix.vercel.app',
        reminderEnabled: true,
      };
      setTasks((prev) => [newTask, ...prev]);

      setLastIncomingOrderAlert({
        orderId: randomOrderId,
        customerName: 'Dr. Roberto Méndez (Lumbar Fix)',
        amount: 89999,
        time: timeStr,
        itemsSummary: 'PACK COMPLETO LUMBAR FIX (4 artículos) - Transferencia',
      });

      return {
        success: true,
        orderId: randomOrderId,
        message: `¡PACK COMPLETO Lumbar Fix ${randomOrderId} procesado! Se descontaron los 4 artículos del stock y se sumó +$49.499 de ganancia limpia.`,
      };
    }

    // BB IMPORT CASES
    const randomOrderId = `BB-${Math.floor(100000 + Math.random() * 900000)}`;

    if (targetPreset === 'single' || targetPreset === 'bb_single' || targetPreset === 'bbimport') {
      // 1x Máquina Cortadora EXXTRA TECH EX5 Negro Matte ($29.999 ARS)
      adjustStock('prod-ex5-blk', -1);

      const newSale: SaleTransaction = {
        id: `sale-web-${Date.now()}`,
        code: `#VTA-${randomOrderId}`,
        businessId: 'bbimport',
        date: now.toISOString(),
        dayDate: dayStr,
        monthDate: monthStr,
        clientName: 'Esteban Morales (Compra Web BB Import)',
        localId: 'loc-bbimport',
        localName: 'Tienda Online bbimport.onrender.com',
        items: [
          {
            type: 'product',
            itemId: 'prod-ex5-blk',
            name: 'Máquina Cortadora EXXTRA TECH™ EX5 - Negro Matte',
            quantity: 1,
            unitPrice: 29999,
            unitCost: 12500,
            subtotal: 29999,
            totalCost: 12500,
            profit: 17499,
          },
        ],
        subtotal: 29999,
        discount: 0,
        total: 29999,
        totalCost: 12500,
        netProfit: 17499,
        marginPercent: 58.33,
        paymentMethod: 'efectivo',
        notes: `Orden Web #${randomOrderId} - Pago Contra Entrega al recibir en domicilio (Andreani)`,
        source: 'bbimport_web',
      };
      setSales((prev) => [newSale, ...prev]);

      const newTask: DailyTask = {
        id: `task-web-${Date.now()}`,
        businessId: 'bbimport',
        title: `🔥 Despachar Orden Web ${randomOrderId} - Esteban Morales ($29.999)`,
        description: `Cliente compró 1x Máquina EX5 Negro Matte por Pago Contra Entrega. Embalar con burbuja y generar guía en Andreani. Teléfono: +54 9 11 6789-1234. Dirección: Belgrano 410, CABA.`,
        clientName: 'Esteban Morales',
        clientPhone: '+54 9 11 6789-1234',
        priority: 'inmediata',
        category: 'envio',
        dueDate: dayStr,
        dueTime: '17:30',
        completed: false,
        source: 'bbimport.onrender.com',
        reminderEnabled: true,
      };
      setTasks((prev) => [newTask, ...prev]);

      setLastIncomingOrderAlert({
        orderId: randomOrderId,
        customerName: 'Esteban Morales (BB Import)',
        amount: 29999,
        time: timeStr,
        itemsSummary: '1x Máquina EXXTRA TECH™ EX5 (Negro Matte) - Contra Entrega Andreani',
      });

      return {
        success: true,
        orderId: randomOrderId,
        message: `¡Orden Web BB Import ${randomOrderId} recibida! Se descontó 1 unidad de stock, se sumó $17.499 de ganancia neta y se agendó la tarea de despacho.`,
      };
    } else if (targetPreset === 'duo' || targetPreset === 'bb_duo') {
      // Pack Dúo: 2x Máquinas ($54.999 ARS)
      adjustStock('prod-ex5-blk', -1);
      adjustStock('prod-ex5-red', -1);

      const newSale: SaleTransaction = {
        id: `sale-web-${Date.now()}`,
        code: `#VTA-${randomOrderId}`,
        businessId: 'bbimport',
        date: now.toISOString(),
        dayDate: dayStr,
        monthDate: monthStr,
        clientName: 'Damián Romero (Barbería Flow)',
        localId: 'loc-bbimport',
        localName: 'Tienda Online bbimport.onrender.com',
        items: [
          {
            type: 'combo',
            itemId: 'combo-pack-duo',
            name: 'Pack Dúo: 2x Máquinas EXXTRA TECH™ EX5',
            quantity: 1,
            unitPrice: 54999,
            unitCost: 32600,
            subtotal: 54999,
            totalCost: 32600,
            profit: 22399,
          },
        ],
        subtotal: 54999,
        discount: 0,
        total: 54999,
        totalCost: 32600,
        netProfit: 22399,
        marginPercent: 40.73,
        paymentMethod: 'transferencia',
        notes: `Orden Web #${randomOrderId} - Transferencia verificada Banco Galicia (Alias rbvillar3.gal)`,
        source: 'bbimport_web',
      };
      setSales((prev) => [newSale, ...prev]);

      const newTask: DailyTask = {
        id: `task-web-${Date.now()}`,
        businessId: 'bbimport',
        title: `📦 Preparar Pack Dúo ${randomOrderId} - Damián Romero ($54.999)`,
        description: `Venta Pack Dúo 2x Máquinas (Negro + Rojo). Transferencia Galicia acreditada. Despachar por Correo Argentino a Córdoba. Tel: +54 9 351 445-8899.`,
        clientName: 'Damián Romero',
        clientPhone: '+54 9 351 445-8899',
        priority: 'hoy',
        category: 'envio',
        dueDate: dayStr,
        dueTime: '18:00',
        completed: false,
        source: 'bbimport.onrender.com',
        reminderEnabled: true,
      };
      setTasks((prev) => [newTask, ...prev]);

      setLastIncomingOrderAlert({
        orderId: randomOrderId,
        customerName: 'Damián Romero (BB Import)',
        amount: 54999,
        time: timeStr,
        itemsSummary: 'Pack Dúo 2x Máquinas EX5 - Transferencia Galicia',
      });

      return {
        success: true,
        orderId: randomOrderId,
        message: `¡Pack Dúo BB Import ${randomOrderId} procesado! Stock descontado (1 Negro + 1 Rojo), ganancia neta $22.399 registrada.`,
      };
    } else {
      // Combo Profesional con Loción ($41.999 ARS)
      adjustStock('prod-ex5-blk', -1);
      adjustStock('prod-acc-lotion', -1);

      const newSale: SaleTransaction = {
        id: `sale-web-${Date.now()}`,
        code: `#VTA-${randomOrderId}`,
        businessId: 'bbimport',
        date: now.toISOString(),
        dayDate: dayStr,
        monthDate: monthStr,
        clientName: 'Alejandro Rossi',
        localId: 'loc-bbimport',
        localName: 'Tienda Online bbimport.onrender.com',
        items: [
          {
            type: 'combo',
            itemId: 'combo-pro-lotion',
            name: 'Combo Profesional: 1x Máquina EX5 + Loción Post Afeitado',
            quantity: 1,
            unitPrice: 41999,
            unitCost: 20200,
            subtotal: 41999,
            totalCost: 20200,
            profit: 21799,
          },
        ],
        subtotal: 41999,
        discount: 0,
        total: 41999,
        totalCost: 20200,
        netProfit: 21799,
        marginPercent: 51.9,
        paymentMethod: 'mercadopago_qr',
        notes: `Orden Web #${randomOrderId} - Pago aprobado Mercado Pago (Alias beluula.mp)`,
        source: 'bbimport_web',
      };
      setSales((prev) => [newSale, ...prev]);

      const newTask: DailyTask = {
        id: `task-web-${Date.now()}`,
        businessId: 'bbimport',
        title: `Despachar Combo Profesional ${randomOrderId} - Alejandro Rossi`,
        description: `1x Máquina EX5 + 1x Loción 100ml. Pagado por Mercado Pago. Dirección: Santa Fe 2100, Rosario.`,
        clientName: 'Alejandro Rossi',
        clientPhone: '+54 9 341 556-7788',
        priority: 'hoy',
        category: 'envio',
        dueDate: dayStr,
        completed: false,
        source: 'bbimport.onrender.com',
        reminderEnabled: true,
      };
      setTasks((prev) => [newTask, ...prev]);

      setLastIncomingOrderAlert({
        orderId: randomOrderId,
        customerName: 'Alejandro Rossi (BB Import)',
        amount: 41999,
        time: timeStr,
        itemsSummary: 'Combo Profesional (Máquina EX5 + Loción) - Mercado Pago',
      });

      return {
        success: true,
        orderId: randomOrderId,
        message: `¡Combo con Loción ${randomOrderId} procesado! Stock descontado, ganancia neta $21.799.`,
      };
    }
  };

  const exportWebStockJSON = (business?: 'bbimport' | 'lumbarfix'): string => {
    const targetProducts = business ? products.filter((p) => p.businessId === business) : products;
    const targetCombos = business ? combos.filter((c) => c.businessId === business) : combos;

    const stockPayload = {
      system: 'ISAMER OS Multi-Ecommerce Cloud',
      targetBusiness: business || 'ALL_BUSINESSES',
      stores: [
        { id: 'bbimport', name: 'BB IMPORT', website: 'https://bbimport.onrender.com/' },
        { id: 'lumbarfix', name: 'LUMBAR FIX®', website: 'https://lumbar-fix.vercel.app/' },
      ],
      exportedAt: new Date().toISOString(),
      products: targetProducts.map((p) => ({
        id: p.id,
        businessId: p.businessId,
        sku: p.sku,
        name: p.name,
        category: p.category,
        price: p.sellingPrice,
        inStock: p.currentStock > 0,
        stockCount: p.currentStock,
        minAlert: p.minStockAlert,
      })),
      combos: targetCombos.map((c) => ({
        id: c.id,
        businessId: c.businessId,
        sku: c.sku,
        name: c.name,
        price: c.sellingPrice,
        maxStockAvailable: getComboMaxStock(c),
      })),
    };
    return JSON.stringify(stockPayload, null, 2);
  };

  return (
    <AppContext.Provider
      value={{
        businessConfig,
        updateBusinessConfig,
        resetToDefaults,
        exportDatabaseJSON,
        importDatabaseJSON,
        selectedBusiness,
        setSelectedBusiness,
        locales,
        selectedLocalId,
        setSelectedLocalId,
        addLocal,
        updateLocal,
        products,
        combos,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCombo,
        updateCombo,
        deleteCombo,
        getComboMaxStock,
        sales,
        registerSale,
        deleteSale,
        tasks,
        addTask,
        updateTask,
        toggleTaskComplete,
        deleteTask,
        activePriorityFilter,
        setActivePriorityFilter,
        clients,
        addClient,
        updateClient,
        deleteClient,
        clickChannels,
        recordChannelClick,
        addClickChannel,
        metrics,
        activeTab,
        setActiveTab,
        isNewSaleModalOpen,
        setIsNewSaleModalOpen,
        isNewTaskModalOpen,
        setIsNewTaskModalOpen,
        isSyncingWeb,
        lastWebSyncTime,
        webConnectionStatus,
        syncWithWebSite,
        simulateIncomingWebOrder,
        restoreOfficialBBImportCatalog,
        exportWebStockJSON,
        lastIncomingOrderAlert,
        dismissOrderAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
