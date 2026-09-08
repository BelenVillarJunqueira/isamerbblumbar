// Meta Pixel & Conversions API Event Integration Module for ISAMER OS
// Dual-Ecommerce tracking for BB IMPORT (bbimport.onrender.com) & LUMBAR FIX® (lumbar-fix.vercel.app)

export type MetaStandardEvent =
    | 'PageView'
    | 'ViewContent'
    | 'AddToCart'
    | 'InitiateCheckout'
    | 'Purchase'
    | 'Lead'
    | 'Contact'
    | 'Search'
    | 'CustomizeProduct';

export interface MetaEventRecord {
    id: string;
    timestamp: string;
    eventName: MetaStandardEvent | string;
    businessId: 'bbimport' | 'lumbarfix' | 'all';
    pixelId: string;
    parameters: Record<string, any>;
    status: 'sent' | 'simulated';
}

export interface MetaPixelConfig {
    bbImportPixelId: string;
    lumbarFixPixelId: string;
    conversionsApiToken?: string;
    testEventCode?: string; // Code from Meta Events Manager (e.g. TEST12345)
    trackInConsole: boolean;
}

const DEFAULT_CONFIG: MetaPixelConfig = {
    bbImportPixelId: '108492049281048', // Meta Pixel ID for BB IMPORT
    lumbarFixPixelId: '219385019384712', // Meta Pixel ID for LUMBAR FIX®
    conversionsApiToken: '',
    testEventCode: 'TEST_ISAMER_COMMERCE',
    trackInConsole: true,
};

const PIXEL_CONFIG_KEY = 'isamer_meta_pixel_config_v1';
const PIXEL_EVENTS_KEY = 'isamer_meta_pixel_events_v1';

export function getMetaPixelConfig(): MetaPixelConfig {
    try {
        const saved = localStorage.getItem(PIXEL_CONFIG_KEY);
        return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch {
        return DEFAULT_CONFIG;
    }
}

export function saveMetaPixelConfig(config: MetaPixelConfig) {
    try {
        localStorage.setItem(PIXEL_CONFIG_KEY, JSON.stringify(config));
        // Also re-init fbq if window is available
        if (typeof window !== 'undefined' && (window as any).fbq) {
            if (config.bbImportPixelId) (window as any).fbq('init', config.bbImportPixelId);
            if (config.lumbarFixPixelId) (window as any).fbq('init', config.lumbarFixPixelId);
        }
    } catch (e) {
        console.error('Error saving Meta Pixel config:', e);
    }
}

export function getStoredMetaEvents(): MetaEventRecord[] {
    try {
        const saved = localStorage.getItem(PIXEL_EVENTS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

function persistMetaEvent(record: MetaEventRecord) {
    try {
        const events = getStoredMetaEvents();
        const updated = [record, ...events].slice(0, 60); // keep last 60 events
        localStorage.setItem(PIXEL_EVENTS_KEY, JSON.stringify(updated));
        // Dispatch custom window event so reactive UI components update instantly
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('isamer-meta-event', { detail: record }));
        }
    } catch (e) {
        console.error('Error saving Meta event record:', e);
    }
}

export function clearStoredMetaEvents() {
    try {
        localStorage.removeItem(PIXEL_EVENTS_KEY);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('isamer-meta-event-cleared'));
        }
    } catch (e) {
        console.error('Error clearing Meta events:', e);
    }
}

// Safe wrapper to invoke window.fbq
function executeFbq(action: 'track' | 'trackCustom', eventName: string, params?: Record<string, any>) {
    if (typeof window === 'undefined') return;

    try {
        if ((window as any).fbq) {
            if (params) {
                (window as any).fbq(action, eventName, params);
            } else {
                (window as any).fbq(action, eventName);
            }
        } else {
            console.warn(`[Meta Pixel fbq fallback] ${action}: ${eventName}`, params);
        }
    } catch (err) {
        console.warn(`[Meta Pixel error handled safely]`, err);
    }
}

/**
 * Main dispatcher to track Meta Pixel & Conversions API events
 */
export function trackMetaEvent(
    eventName: MetaStandardEvent | string,
    parameters: Record<string, any> = {},
    businessId: 'bbimport' | 'lumbarfix' | 'all' = 'all'
): MetaEventRecord {
    const config = getMetaPixelConfig();
    const pixelId =
        businessId === 'lumbarfix'
            ? config.lumbarFixPixelId
            : businessId === 'bbimport'
                ? config.bbImportPixelId
                : `${config.bbImportPixelId} / ${config.lumbarFixPixelId}`;

    // Enrich with standard Meta params
    const enrichedParams: Record<string, any> = {
        ...parameters,
        event_source_url: typeof window !== 'undefined' ? window.location.href : '',
        business_target: businessId,
        timestamp: new Date().toISOString(),
    };

    // Add test_event_code if specified in Meta Events Manager
    if (config.testEventCode) {
        enrichedParams.test_event_code = config.testEventCode;
    }

    // Determine standard vs custom
    const isStandard = [
        'PageView',
        'ViewContent',
        'AddToCart',
        'InitiateCheckout',
        'Purchase',
        'Lead',
        'Contact',
        'Search',
        'CustomizeProduct',
    ].includes(eventName);

    executeFbq(isStandard ? 'track' : 'trackCustom', eventName, enrichedParams);

    if (config.trackInConsole) {
        console.log(`%c[META PIXEL EVENT: ${eventName}]`, 'color: #00c8ff; font-weight: bold;', {
            business: businessId,
            pixelId,
            parameters: enrichedParams,
        });
    }

    const record: MetaEventRecord = {
        id: `meta-evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        eventName,
        businessId,
        pixelId,
        parameters: enrichedParams,
        status: 'sent',
    };

    persistMetaEvent(record);
    return record;
}

// Helpers for standard E-commerce events
export const metaPixelTracker = {
    pageView: (pageName: string, businessId: 'bbimport' | 'lumbarfix' | 'all' = 'all') => {
        return trackMetaEvent('PageView', { page_title: pageName }, businessId);
    },

    viewContent: (item: {
        id: string;
        name: string;
        category?: string;
        price: number;
        businessId: 'bbimport' | 'lumbarfix';
        isCombo?: boolean;
    }) => {
        return trackMetaEvent(
            'ViewContent',
            {
                content_name: item.name,
                content_ids: [item.id],
                content_type: item.isCombo ? 'combo_group' : 'product',
                content_category: item.category || 'Ecommerce Catalog',
                value: item.price,
                currency: 'ARS',
            },
            item.businessId
        );
    },

    addToCart: (item: {
        id: string;
        name: string;
        price: number;
        quantity: number;
        businessId: 'bbimport' | 'lumbarfix';
    }) => {
        return trackMetaEvent(
            'AddToCart',
            {
                content_name: item.name,
                content_ids: [item.id],
                content_type: 'product',
                value: item.price * item.quantity,
                currency: 'ARS',
                num_items: item.quantity,
            },
            item.businessId
        );
    },

    initiateCheckout: (cart: {
        total: number;
        numItems: number;
        businessId: 'bbimport' | 'lumbarfix';
    }) => {
        return trackMetaEvent(
            'InitiateCheckout',
            {
                value: cart.total,
                currency: 'ARS',
                num_items: cart.numItems,
                content_type: 'product',
            },
            cart.businessId
        );
    },

    purchase: (sale: {
        orderId: string;
        total: number;
        contentIds: string[];
        numItems: number;
        businessId: 'bbimport' | 'lumbarfix';
        customerName?: string;
        paymentMethod?: string;
    }) => {
        return trackMetaEvent(
            'Purchase',
            {
                order_id: sale.orderId,
                value: sale.total,
                currency: 'ARS',
                content_ids: sale.contentIds,
                content_type: 'product',
                num_items: sale.numItems,
                payment_method: sale.paymentMethod || 'online',
                customer_segment: 'ecommerce_buyer',
            },
            sale.businessId
        );
    },

    lead: (info: {
        clientName: string;
        clientPhone?: string;
        source: string;
        businessId: 'bbimport' | 'lumbarfix';
    }) => {
        return trackMetaEvent(
            'Lead',
            {
                content_name: `Lead WhatsApp / CRM: ${info.clientName}`,
                lead_source: info.source,
                currency: 'ARS',
                value: 1000, // estimated lead value
            },
            info.businessId
        );
    },

    contact: (channel: string, businessId: 'bbimport' | 'lumbarfix' = 'bbimport') => {
        return trackMetaEvent(
            'Contact',
            {
                contact_channel: channel,
            },
            businessId
        );
    },
};
