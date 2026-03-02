import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const euCountries = ["gb", "de", "dk", "se", "fr", "es", "it"];
  const naCountries = ["us", "ca"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "eur",
          is_default: true,
        },
        {
          currency_code: "usd",
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "North America",
          currency_code: "usd",
          countries: naCountries,
          payment_providers: ["pp_system_default"],
        },
        {
          name: "Europe",
          currency_code: "eur",
          countries: euCountries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0]; // North America (USD default)
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: [...naCountries, ...euCountries].map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Bergkraft Main Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Main Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Worldwide",
        geo_zones: [
          // North America
          { country_code: "us", type: "country" },
          { country_code: "ca", type: "country" },
          // Europe
          { country_code: "gb", type: "country" },
          { country_code: "de", type: "country" },
          { country_code: "dk", type: "country" },
          { country_code: "se", type: "country" },
          { country_code: "fr", type: "country" },
          { country_code: "es", type: "country" },
          { country_code: "it", type: "country" },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Webshop",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        { name: "Coffee Beans", is_active: true },
        { name: "Equipment", is_active: true },
        { name: "Merchandise", is_active: true },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        // ── Espresso Blend ────────────────────────────────────────────────────
        {
          title: "Bergkraft Espresso Blend",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Coffee Beans")!.id,
          ],
          description:
            "Rich and bold espresso with notes of dark chocolate and caramel. Single origin, ethically sourced from the highlands of Ethiopia.",
          handle: "espresso-blend",
          weight: 250,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [{ title: "Weight", values: ["250g", "500g", "1kg"] }],
          variants: [
            {
              title: "250g",
              sku: "BKESPRESSO-250G",
              options: { Weight: "250g" },
              prices: [
                { amount: 1299, currency_code: "eur" },
                { amount: 1499, currency_code: "usd" },
              ],
            },
            {
              title: "500g",
              sku: "BKESPRESSO-500G",
              options: { Weight: "500g" },
              prices: [
                { amount: 2399, currency_code: "eur" },
                { amount: 2699, currency_code: "usd" },
              ],
            },
            {
              title: "1kg",
              sku: "BKESPRESSO-1KG",
              options: { Weight: "1kg" },
              prices: [
                { amount: 4199, currency_code: "eur" },
                { amount: 4799, currency_code: "usd" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        // ── House Blend ───────────────────────────────────────────────────────
        {
          title: "Bergkraft House Blend",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Coffee Beans")!.id,
          ],
          description:
            "Our signature smooth and balanced blend with hints of hazelnut and vanilla. Ideal for drip, pour-over, or French press.",
          handle: "house-blend",
          weight: 250,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            { title: "Weight", values: ["250g", "500g"] },
            { title: "Grind", values: ["Whole Bean", "Ground (Medium)"] },
          ],
          variants: [
            {
              title: "250g / Whole Bean",
              sku: "BKHOUSE-250G-WB",
              options: { Weight: "250g", Grind: "Whole Bean" },
              prices: [
                { amount: 1099, currency_code: "eur" },
                { amount: 1299, currency_code: "usd" },
              ],
            },
            {
              title: "500g / Whole Bean",
              sku: "BKHOUSE-500G-WB",
              options: { Weight: "500g", Grind: "Whole Bean" },
              prices: [
                { amount: 1999, currency_code: "eur" },
                { amount: 2299, currency_code: "usd" },
              ],
            },
            {
              title: "250g / Ground (Medium)",
              sku: "BKHOUSE-250G-GRD",
              options: { Weight: "250g", Grind: "Ground (Medium)" },
              prices: [
                { amount: 1099, currency_code: "eur" },
                { amount: 1299, currency_code: "usd" },
              ],
            },
            {
              title: "500g / Ground (Medium)",
              sku: "BKHOUSE-500G-GRD",
              options: { Weight: "500g", Grind: "Ground (Medium)" },
              prices: [
                { amount: 1999, currency_code: "eur" },
                { amount: 2299, currency_code: "usd" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        // ── French Press ──────────────────────────────────────────────────────
        {
          title: "Bergkraft Premium French Press",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Equipment")!.id,
          ],
          description:
            "Stainless steel French Press with double-wall insulation for the perfect cup every time. Includes a starter pack of House Blend.",
          handle: "french-press",
          weight: 800,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [{ title: "Capacity", values: ["350ml", "1000ml"] }],
          variants: [
            {
              title: "350ml",
              sku: "BKFP-350ML",
              options: { Capacity: "350ml" },
              prices: [
                { amount: 2699, currency_code: "eur" },
                { amount: 2999, currency_code: "usd" },
              ],
            },
            {
              title: "1000ml",
              sku: "BKFP-1000ML",
              options: { Capacity: "1000ml" },
              prices: [
                { amount: 3999, currency_code: "eur" },
                { amount: 4499, currency_code: "usd" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        // ── Tote Bag ──────────────────────────────────────────────────────────
        {
          title: "Bergkraft Canvas Tote Bag",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Merchandise")!.id,
          ],
          description:
            "Sustainable heavyweight canvas tote with the Bergkraft logo, screen-printed with water-based inks.",
          handle: "canvas-tote-bag",
          weight: 300,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [{ title: "Color", values: ["Natural", "Black"] }],
          variants: [
            {
              title: "Natural",
              sku: "BKTOTE-NAT",
              options: { Color: "Natural" },
              prices: [
                { amount: 1799, currency_code: "eur" },
                { amount: 1999, currency_code: "usd" },
              ],
            },
            {
              title: "Black",
              sku: "BKTOTE-BLK",
              options: { Color: "Black" },
              prices: [
                { amount: 1799, currency_code: "eur" },
                { amount: 1999, currency_code: "usd" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
