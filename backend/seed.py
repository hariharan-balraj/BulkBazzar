"""Run once: python seed.py  (from the backend/ directory)"""
import sqlite3, json

DB = "app.db"

SCHEMA = """
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'buyer',
    name TEXT DEFAULT '',
    location_lat REAL DEFAULT 0.0,
    location_lng REAL DEFAULT 0.0,
    subscription_status TEXT DEFAULT 'free',
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT NOT NULL,
    price REAL NOT NULL,
    unit TEXT NOT NULL DEFAULT 'kg',
    quantity REAL DEFAULT 0.0,
    location_lat REAL DEFAULT 0.0,
    location_lng REAL DEFAULT 0.0,
    location_name TEXT DEFAULT '',
    media_urls_json TEXT DEFAULT '[]',
    video_url TEXT DEFAULT '',
    store_name TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (listing_id) REFERENCES listings(id)
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id, created_at);
CREATE INDEX IF NOT EXISTS idx_listings_cat ON listings(category, status, created_at);
CREATE INDEX IF NOT EXISTS idx_events_listing ON events(listing_id, created_at);
"""

DEMO_NOTE = "\n\n⚠️ This seller is currently not available. Listed for demonstration purposes only."

# All images verified on Unsplash — real photographs, not placeholders
def img(photo_id):
    return f"https://images.unsplash.com/{photo_id}?w=800&h=600&fit=crop"

# 30 products — 3 per category, alternating sellers
# Even index (0,2,4,...) → demo seller (Koyambedu Agro Traders, out of stock)
# Odd index  (1,3,5,...) → real seller (Sri Murugan Wholesale, in stock)
#
# (title, category, price, unit, real_qty, location, description, verified_img_url)
PRODUCTS = [

    # ── AGRICULTURE ──────────────────────────────────────────────────
    # Image: tomatoes at a market (red & green) — verified ✓
    ("Fresh Grade A Tomatoes", "agriculture", 38, "kg", 800,
     "Koyambedu Market, Chennai",
     "Farm-fresh Grade A tomatoes from Thiruvallur district. Rich red colour, firm texture. "
     "Ideal for hotels, restaurants and vegetable retailers. Minimum order 50 kg. "
     "Daily harvest — supply available throughout the year.",
     img("photo-1683354918366-ad5c9aacbf40")),

    # Image: fresh yellow king coconuts piled high — verified ✓
    ("Fresh Coconuts – Pollachi Farm", "agriculture", 18, "piece", 5000,
     "Pollachi, Tamil Nadu",
     "Medium and large coconuts directly from Pollachi belt farms. "
     "Water coconuts and copra-grade available. Sugar content tested. "
     "Bulk supply to coconut oil mills, sweet manufacturers and retailers.",
     img("photo-1743947064524-460d8db07f1a")),

    # Image: jasmine vine with white fragrant flowers — verified ✓
    ("Madurai Malli Jasmine Flowers", "agriculture", 350, "kg", 100,
     "Madurai, Tamil Nadu",
     "GI-tagged Madurai Malli jasmine, freshly harvested at 4 am daily. "
     "Naturally fragrant, no cold-storage damage. Supplied to temples, "
     "event management companies and perfume manufacturers across South India.",
     img("photo-1553719882-c0592c54478d")),

    # ── LIVESTOCK & FOOD ─────────────────────────────────────────────
    # Image: glass milk bottles arranged together — verified ✓
    ("Fresh Buffalo Milk – Daily Supply", "livestock", 55, "litre", 1000,
     "Vellore, Tamil Nadu",
     "Fresh buffalo milk with 6–7% fat content. Hygienically collected "
     "and chilled within 2 hours of milking. Supplied daily to dairies, "
     "paneer manufacturers and traditional sweet shops.",
     img("photo-1523473827533-2a64d0d36748")),

    # Image: squid and fresh seafood on ice from Kerala, India — verified ✓
    ("Fresh Seafood – Rameswaram Catch", "livestock", 650, "kg", 150,
     "Rameswaram, Tamil Nadu",
     "Mixed fresh seafood catch from Gulf of Mannar — seer fish, squid, prawns. "
     "Iced and transported within 6 hours of landing. "
     "Supplied to coastal hotels, seafood restaurants and export processing units.",
     img("photo-1749522714946-c39b846c2dac")),

    # Image: golden honeycomb beside ceramic bowls — verified ✓
    ("Pure Forest Honey – Anamalai Hills", "livestock", 850, "kg", 200,
     "Valparai, Tamil Nadu",
     "Raw forest honey from Anamalai hills, unprocessed and unheated. "
     "Multiple floral varieties: eucalyptus, wild flower and coffee blossom. "
     "Supplied to health stores, Ayurvedic companies and premium retail chains.",
     img("photo-1574515518130-6488e739ffff")),

    # ── TEXTILE ──────────────────────────────────────────────────────
    # Image: workers in an apparel factory — verified ✓
    ("Cotton T-Shirts – Tirupur Bulk", "textile", 75, "piece", 5000,
     "Tirupur, Tamil Nadu",
     "Round-neck cotton T-shirts, 180 GSM combed cotton. Sizes S to 3XL. "
     "White and 30+ colour options. Minimum 100 pcs per order. "
     "OEM branding and custom label printing available.",
     img("photo-1741591646784-d4af2fa75c90")),

    # Image: woman in traditional green saree with jewellery — verified ✓
    ("Kanjivaram Silk Sarees – Wholesale", "textile", 4500, "piece", 200,
     "Kanchipuram, Tamil Nadu",
     "Authentic handwoven Kanjivaram silk sarees with GI certification. "
     "Pure silk with real zari border. Over 50 colour combinations available. "
     "Bulk pricing for retail chains, boutiques and NRI gifting.",
     img("photo-1679006831648-7c9ea12e5807")),

    # Image: artisan operating handloom in Pochampally, India — verified ✓
    ("Handloom Cotton Sarees – Mill Direct", "textile", 850, "piece", 500,
     "Madurai, Tamil Nadu",
     "Traditional handloom cotton sarees woven on pit looms by skilled weavers. "
     "Natural dye options available. KVIC certified. "
     "Supplied to government emporiums, boutiques and online handicraft platforms.",
     img("photo-1640292343595-889db1c8262e")),

    # ── MANUFACTURING ────────────────────────────────────────────────
    # Image: red hard hat / safety helmet on pavement — verified ✓
    ("ISI Safety Helmets – Bulk Supply", "manufacturing", 185, "piece", 5000,
     "Coimbatore, Tamil Nadu",
     "HDPE safety helmets with 6-point ratchet suspension. IS:2925 certified. "
     "Ratchet, pinlock and vented models available. "
     "Custom colour and logo printing for construction companies and factories.",
     img("photo-1567954970774-58d6aa6c50dc")),

    # Image: grey and white ceramic tile pattern — verified ✓
    ("Vitrified Floor Tiles (24×24 inch)", "manufacturing", 45, "piece", 50000,
     "Morbi, Gujarat",
     "Double-charged vitrified tiles, 24×24 inch, 7mm thickness. "
     "300+ designs — marble, stone and wood looks. PEI-4 wear rating. "
     "Supplied to builders, interior contractors and tile retail shops.",
     img("photo-1558618666-fcd25c85cd64")),

    # Image: cement blocks on a shovel, tagged 'cement' — verified ✓
    ("Portland Pozzolana Cement (50 kg)", "manufacturing", 420, "bag", 5000,
     "Chennai, Tamil Nadu",
     "PPC 43-grade cement in 50 kg PP woven bags. ISI-marked. "
     "Consistent strength, low heat of hydration. "
     "Bulk supply to construction contractors, RMC plants and hardware dealers.",
     img("photo-1560435650-7ec2e17ba926")),

    # ── FOOD & SPICES ────────────────────────────────────────────────
    # Image: turmeric powder, tagged 'turmeric' — verified ✓
    ("Erode Gold Turmeric Powder", "spices", 185, "kg", 2000,
     "Erode, Tamil Nadu",
     "Premium Erode turmeric powder from Asia's largest turmeric market. "
     "Curcumin content above 5%, ASTA colour 40+. FSSAI certified. "
     "Supplied in 25 kg PP bags to spice brands, masala companies and exporters.",
     img("photo-1702041295331-840d4d9aa7c9")),

    # Image: bottle of coconut oil next to a fresh coconut — verified ✓
    ("Cold-Pressed Virgin Coconut Oil", "spices", 280, "litre", 2000,
     "Pollachi, Tamil Nadu",
     "Virgin cold-pressed coconut oil extracted below 40°C. No heat treatment. "
     "Rich in MCT and lauric acid. FSSAI certified. "
     "Supplied to health food brands, ayurvedic companies and premium retailers.",
     img("photo-1690228987673-f6e104fa653c")),

    # Image: palm jaggery / palm sugar blocks — from agent
    ("Palm Jaggery – Karupatti (Bulk)", "spices", 160, "kg", 1500,
     "Tirunelveli, Tamil Nadu",
     "Traditional palm sugar jaggery (karupatti) from Palmyra palms. "
     "Rich in minerals — iron, calcium and potassium. No chemicals or additives. "
     "Supplied to Ayurvedic brands, organic food stores and export units.",
     img("photo-1559477882-f1a7c5931735")),

    # ── CONSTRUCTION ─────────────────────────────────────────────────
    # Image: close-up fine grey sand texture — from agent (2025)
    ("M-Sand – River Grade (Bulk)", "construction", 850, "tonne", 500,
     "Salem, Tamil Nadu",
     "TNPCB-approved manufactured sand for concrete and plastering. "
     "Free from clay, silt and organic matter. Consistent gradation tested. "
     "Bulk supply with tipper lorry delivery to construction sites in Tamil Nadu.",
     img("photo-1760131185787-597c462d6196")),

    # Image: black marble/granite polished surface — verified ✓
    ("Black Galaxy Granite Slabs", "construction", 280, "piece", 2000,
     "Krishnagiri, Tamil Nadu",
     "Premium black granite slabs with galaxy sparkle. 18mm polished finish. "
     "Quarried from Krishnagiri belt. "
     "Supplied to interior designers, kitchen fabricators and flooring contractors.",
     img("photo-1699982758974-0703b87f052d")),

    # Image: brutalist concrete block patterns — verified ✓
    ("Hollow Concrete Blocks (6 inch)", "construction", 28, "piece", 100000,
     "Coimbatore, Tamil Nadu",
     "6-inch hollow concrete blocks. Compressive strength 7.5 MPa. "
     "IS:2185 certified. Uniform size and weight. "
     "Used for load-bearing walls and partitions. Bulk pricing for builders.",
     img("photo-1565626424178-c699f6601afd")),

    # ── ELECTRICAL & ELECTRONICS ─────────────────────────────────────
    # Image: rooftop solar panels — verified ✓ (free Unsplash license)
    ("Rooftop Solar Panels (380W Poly)", "electrical", 8500, "piece", 500,
     "Chennai, Tamil Nadu",
     "380W polycrystalline solar panels with 25-year performance warranty. "
     "IP67 weatherproof junction box, anti-PID technology. "
     "Supplied to rooftop installers, agri-solar projects and EPC contractors.",
     img("photo-1745187946672-2c1d8cf26a2b")),

    # Image: electric motor coil close-up — verified ✓
    ("3-Phase Induction Motors (1–10 HP)", "electrical", 4800, "piece", 200,
     "Coimbatore, Tamil Nadu",
     "IE2 and IE3 efficiency class induction motors. IP55 protection rating. "
     "Foot and flange mounting. BIS certified. 1-year warranty. "
     "Used in pumps, fans, compressors and industrial machinery.",
     img("photo-1692719094491-2746e82a8595")),

    # Image: street light at night, urban setting — verified ✓
    ("LED Street Lights (100W, IP66)", "electrical", 2800, "piece", 500,
     "Coimbatore, Tamil Nadu",
     "100W LED street lights with 140 lm/W efficacy. IP66 weatherproof rated. "
     "5-year manufacturer warranty. BEE 5-star registered. "
     "Supplied to municipalities, industrial estates and highway projects.",
     img("photo-1604315523775-74cee3df116c")),

    # ── HANDICRAFTS & GIFTS ──────────────────────────────────────────
    # Image: traditional Indian painting — verified ✓
    ("Tanjore Paintings – Traditional Art", "handicrafts", 2500, "piece", 200,
     "Thanjavur, Tamil Nadu",
     "Handmade Tanjore paintings with 22-carat gold foil work. "
     "Themes: Hindu deities, royal court scenes and nature. "
     "Sizes 12×18 inch to 24×36 inch. Supplied to temple gift shops and exporters.",
     img("photo-1714248376481-f3e37e023ec8")),

    # Image: person holding lit diya/candle — verified ✓ (tagged 'diya')
    ("Brass Oil Lamps – Kuthu Vilakku", "handicrafts", 450, "piece", 500,
     "Coimbatore, Tamil Nadu",
     "Traditional South Indian kuthu vilakku brass oil lamps. "
     "Height 12 to 36 inches. Antique brass and polished finish options. "
     "Suitable for temples, homes and gifting. Bulk pricing for pooja stores.",
     img("photo-1700403455026-3559b076ff03")),

    # Image: hands shaping clay on a pottery wheel — verified ✓
    ("Terracotta Pots & Garden Planters", "handicrafts", 180, "piece", 1000,
     "Vellore, Tamil Nadu",
     "Handmade terracotta pots, planters and decorative items by traditional potters. "
     "Natural clay kiln-fired at high temperature. "
     "Eco-friendly and chemical-free. Bulk pricing for garden centres and nurseries.",
     img("photo-1529690840038-f38da8894ff6")),

    # ── HEALTHCARE & PHARMA ──────────────────────────────────────────
    # Image: green matcha/moringa powder with measuring spoon — verified ✓
    ("Organic Moringa Leaf Powder", "healthcare", 380, "kg", 1000,
     "Salem, Tamil Nadu",
     "Certified organic moringa (murungai) powder from PKM-1 variety trees. "
     "Spray-dried for maximum nutrient retention. 40+ vitamins and minerals. "
     "No additives. Supplied to nutraceutical brands and health food exporters.",
     img("photo-1566373104181-133b57c9fd98")),

    # Image: neem leaves close-up on a tree — from agent
    ("Pure Neem Leaf Powder", "healthcare", 185, "kg", 2000,
     "Coimbatore, Tamil Nadu",
     "Air-dried neem leaves milled to fine powder. Rich in nimbidin and azadirachtin. "
     "Used in herbal toothpaste, skin care, veterinary feed and organic pesticides. "
     "Supplied to Ayurvedic manufacturers and organic cosmetic brands.",
     img("photo-1669574753113-6442f2cc69b7")),

    # Image: five spoons of colourful spice powders — verified ✓
    ("Triphala Churna – Ayurvedic Bulk", "healthcare", 220, "kg", 1500,
     "Coimbatore, Tamil Nadu",
     "Classic Ayurvedic Triphala churna — equal parts amla, haritaki and bibhitaki. "
     "GMP-certified manufacturing, COA provided per batch. "
     "Supplied to Ayurvedic pharmacies, nutraceutical brands and online health stores.",
     img("photo-1506368249639-73a05d6f6488")),

    # ── PLASTICS & PACKAGING ─────────────────────────────────────────
    # Image: open brown corrugated shipping boxes — verified ✓
    ("5-ply Corrugated Shipping Boxes", "plastics", 45, "piece", 20000,
     "Chennai, Tamil Nadu",
     "5-ply corrugated boxes for e-commerce, FMCG and garment packaging. "
     "Sizes from A4 mailer to 24×18×18 inch master carton. "
     "Custom colour printing up to 4 colours. Minimum order 500 boxes.",
     img("photo-1700165644892-3dd6b67b25bc")),

    # Image: food-grade plastic containers from agent
    ("Food-Grade PP Containers (1L)", "plastics", 22, "piece", 50000,
     "Chennai, Tamil Nadu",
     "Microwaveable polypropylene containers with snap-lock lids. 1L capacity. "
     "BPA-free, FDA food-safe grade. Stackable design for logistics efficiency. "
     "Supplied to meal kit companies, dairies, cloud kitchens and caterers.",
     img("photo-1564339081-9b6e49babdef")),

    # Image: assorted coloured woven sacks, Dhaka Bangladesh — verified ✓
    ("PP Woven Sacks (50 kg capacity)", "plastics", 18, "piece", 50000,
     "Ahmedabad, Gujarat",
     "Polypropylene woven sacks, 50 kg load capacity. Laminated and unlaminated options. "
     "Custom flexo printing in up to 3 colours. "
     "Used for cement, rice, animal feed and fertiliser packing. MOQ 1000 pcs.",
     img("photo-1523293915678-d126868e96f1")),
]

DEMO_SELLER = {"phone": "9999999999", "name": "Koyambedu Agro Traders"}
REAL_SELLER = {"phone": "9360866037", "name": "Sri Murugan Wholesale"}


def main():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    for stmt in SCHEMA.strip().split(";"):
        s = stmt.strip()
        if s:
            cur.execute(s)
    conn.commit()

    for seller in [DEMO_SELLER, REAL_SELLER]:
        cur.execute(
            "INSERT OR IGNORE INTO users (phone, role, name) VALUES (?, 'seller', ?)",
            (seller["phone"], seller["name"]),
        )
    conn.commit()

    cur.execute("SELECT id FROM users WHERE phone = ?", (DEMO_SELLER["phone"],))
    demo_id = cur.fetchone()[0]
    cur.execute("SELECT id FROM users WHERE phone = ?", (REAL_SELLER["phone"],))
    real_id = cur.fetchone()[0]

    cur.execute(
        "UPDATE users SET subscription_status = 'verified' WHERE phone = ?",
        (DEMO_SELLER["phone"],),
    )
    conn.commit()

    inserted = 0
    for i, (title, category, price, unit, real_qty, location, desc, img_url) in enumerate(PRODUCTS):
        is_demo      = (i % 2 == 0)
        seller_id    = demo_id if is_demo else real_id
        store_name   = DEMO_SELLER["name"] if is_demo else REAL_SELLER["name"]
        quantity     = 0 if is_demo else real_qty
        description  = desc + DEMO_NOTE if is_demo else desc

        cur.execute(
            """INSERT INTO listings
               (seller_id, title, description, category, price, unit,
                quantity, location_name, media_urls_json, video_url, store_name)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (seller_id, title, description, category, price, unit,
             quantity, location, json.dumps([img_url]), "", store_name),
        )
        inserted += 1

    conn.commit()
    conn.close()
    print(f"Seeded {inserted} listings — {inserted // 2} demo (out of stock) + {inserted - inserted // 2} real (in stock)")
    print(f"Sellers: {DEMO_SELLER['name']} ({DEMO_SELLER['phone']}) | {REAL_SELLER['name']} ({REAL_SELLER['phone']})")


if __name__ == "__main__":
    main()
