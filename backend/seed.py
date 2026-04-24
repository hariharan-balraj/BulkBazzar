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

def img(keywords, lock):
    return f"https://loremflickr.com/800/600/{keywords}?lock={lock}"

# 30 products — 3 per category
# Even index (0,2,4,...) → demo seller (out of stock)
# Odd index  (1,3,5,...) → real seller (in stock)
# (title, category, price, unit, real_qty, location, description, img_url)
PRODUCTS = [
    # ── AGRICULTURE ──────────────────────────────────────────────────────
    ("Fresh Red Tomatoes – Grade A", "agriculture", 38, "kg", 800,
     "Koyambedu Market, Chennai",
     "Farm-fresh Grade A tomatoes from Thiruvallur district. Rich red colour, firm texture. Ideal for hotels, restaurants and retailers. Minimum order 50 kg.",
     img("tomatoes,red,vegetables", 1)),

    ("Fresh Coconuts (Pollachi)", "agriculture", 18, "piece", 5000,
     "Pollachi, Tamil Nadu",
     "Medium and large coconuts from Pollachi belt. Water coconuts and copra grade available. Direct from farm. Available year-round.",
     img("coconut,tropical,fruit", 6)),

    ("Madurai Malli Jasmine Flowers", "agriculture", 350, "kg", 100,
     "Madurai, Tamil Nadu",
     "GI-tagged Madurai Malli jasmine. Freshly harvested at 4 am daily. Supplied to temples, event companies and perfume manufacturers.",
     img("jasmine,flower,white", 22)),

    # ── LIVESTOCK & FOOD ──────────────────────────────────────────────────
    ("Fresh Buffalo Milk", "livestock", 55, "litre", 1000,
     "Vellore, Tamil Nadu",
     "Fresh buffalo milk with 6–7% fat content. Supplied daily to dairies, paneer manufacturers and sweet shops. Hygienically collected and chilled.",
     img("milk,buffalo,dairy", 39)),

    ("Vanjaram Fish (King Fish)", "livestock", 750, "kg", 100,
     "Rameswaram, Tamil Nadu",
     "Fresh-caught seer fish from Gulf of Mannar. Iced and transported within 6 hours of catch. Supplied to hotels and fish markets.",
     img("fish,seafood,ocean", 41)),

    ("Pure Forest Honey (Anamalai)", "livestock", 850, "kg", 200,
     "Valparai, Tamil Nadu",
     "Raw forest honey from Anamalai hills. Unprocessed and unheated. Multiple floral varieties. Supplied to health stores and Ayurvedic companies.",
     img("honey,golden,natural", 45)),

    # ── TEXTILE ───────────────────────────────────────────────────────────
    ("Cotton T-Shirts (Bulk – 180 GSM)", "textile", 75, "piece", 5000,
     "Tirupur, Tamil Nadu",
     "Round-neck cotton T-shirts, 180 GSM. Sizes S to XXL. White and multicolour. Minimum 100 pcs per order. OEM printing available.",
     img("tshirt,cotton,fashion", 61)),

    ("Kanjivaram Silk Sarees", "textile", 4500, "piece", 200,
     "Kanchipuram, Tamil Nadu",
     "Authentic handwoven Kanjivaram silk sarees with GI tag. Pure zari border. Available in 50+ colour combinations. Bulk pricing for retailers.",
     img("saree,silk,colorful", 62)),

    ("Handloom Cotton Sarees", "textile", 850, "piece", 500,
     "Madurai, Tamil Nadu",
     "Traditional handloom sarees woven on pit looms. Pure cotton, natural dyes option. Supplied to govt emporiums and boutiques across Tamil Nadu.",
     img("saree,handloom,cotton", 74)),

    # ── MANUFACTURING ─────────────────────────────────────────────────────
    ("Safety Helmets (ISI Marked)", "manufacturing", 185, "piece", 5000,
     "Coimbatore, Tamil Nadu",
     "HDPE safety helmets with 6-point suspension. IS:2925 certified. Ratchet and pinlock models. Custom printing available for bulk orders.",
     img("helmet,safety,construction", 93)),

    ("Ceramic Floor Tiles (24x24 inch)", "manufacturing", 45, "piece", 50000,
     "Morbi, Gujarat",
     "Double-charged vitrified tiles, 24x24 inch. 7mm thickness. 300+ designs available. PEI-4 wear rating. Supplied to builders and tile shops.",
     img("tiles,ceramic,floor", 88)),

    ("PPC Cement (50 kg Bag)", "manufacturing", 420, "bag", 5000,
     "Chennai, Tamil Nadu",
     "Portland Pozzolana Cement. 43 grade. ISI-marked. Supplied in 50 kg PP bags. Bulk pricing for contractors. Delivery within 48 hours.",
     img("cement,bag,construction", 89)),

    # ── FOOD & SPICES ─────────────────────────────────────────────────────
    ("Erode Gold Turmeric Powder", "spices", 185, "kg", 2000,
     "Erode, Tamil Nadu",
     "Premium Erode turmeric powder. Curcumin content above 5%. Bright yellow colour. FSSAI-certified. Supplied in 25 kg bags to spice brands and exporters.",
     img("turmeric,powder,yellow", 101)),

    ("Cold-Pressed Coconut Oil (Virgin)", "spices", 280, "litre", 2000,
     "Pollachi, Tamil Nadu",
     "Virgin cold-pressed coconut oil extracted from fresh coconuts at 40°C. No heat treatment. Rich in MCTs. Supplied to health stores and FMCG brands.",
     img("coconut,oil,natural", 108)),

    ("Palm Jaggery – Karupatti", "spices", 160, "kg", 1500,
     "Tirunelveli, Tamil Nadu",
     "Traditional palm sugar jaggery (karupatti). Rich mineral content. Natural sweetener. No chemicals or additives. Supplied to Ayurvedic brands.",
     img("jaggery,palm,brown", 109)),

    # ── CONSTRUCTION ──────────────────────────────────────────────────────
    ("M-Sand (River Grade)", "construction", 850, "tonne", 500,
     "Salem, Tamil Nadu",
     "Manufactured sand for concrete and plaster. TNPCB-approved. Free from silt and organic matter. Bulk supply to construction sites in Tamil Nadu.",
     img("sand,construction,building", 117)),

    ("Black Galaxy Granite Slabs", "construction", 280, "piece", 2000,
     "Krishnagiri, Tamil Nadu",
     "Premium black galaxy granite slabs, 18mm thickness. Polished finish. Quarried from Krishnagiri belt. Supplied to interior contractors and fabricators.",
     img("granite,black,stone", 118)),

    ("Hollow Concrete Blocks (6 inch)", "construction", 28, "piece", 100000,
     "Coimbatore, Tamil Nadu",
     "6-inch hollow concrete blocks. Compressive strength 7.5 MPa. IS:2185 certified. Used for load-bearing and partition walls. Bulk pricing available.",
     img("concrete,block,hollow", 122)),

    # ── ELECTRICAL & ELECTRONICS ──────────────────────────────────────────
    ("Solar Panels (380W Polycrystalline)", "electrical", 8500, "piece", 500,
     "Chennai, Tamil Nadu",
     "380W poly solar panels. 25-year performance warranty. IP67 junction box. Supplied to solar installers, rooftop project companies and agri-solar farms.",
     img("solar,panel,energy", 131)),

    ("3-Phase Electric Motors (1–10 HP)", "electrical", 4800, "piece", 200,
     "Coimbatore, Tamil Nadu",
     "IE2 and IE3 efficiency class motors. IP55 protection. Used in pumps, compressors and machinery. BIS-certified. 1-year warranty included.",
     img("motor,electric,industrial", 132)),

    ("LED Street Lights (100W)", "electrical", 2800, "piece", 500,
     "Coimbatore, Tamil Nadu",
     "100W LED street lights. 140 lm/W efficacy. IP66 rated. 5-year warranty. Used by municipalities and industrial campuses. BEE registered.",
     img("led,streetlight,outdoor", 136)),

    # ── HANDICRAFTS & GIFTS ───────────────────────────────────────────────
    ("Tanjore Paintings (Traditional)", "handicrafts", 2500, "piece", 200,
     "Thanjavur, Tamil Nadu",
     "Traditional Tanjore paintings with gold foil work. Themes: deities, royalty and nature. Handmade by skilled artisans. Sizes 12x18 to 24x36 inch.",
     img("tanjore,painting,art", 146)),

    ("Brass Oil Lamps (Puja Diya)", "handicrafts", 450, "piece", 500,
     "Coimbatore, Tamil Nadu",
     "Handcrafted brass oil lamps. Traditional South Indian design. Height 12 to 24 inches. Suitable for temples, homes and gifting. Antique finish available.",
     img("brass,lamp,golden", 147)),

    ("Terracotta Pots & Pottery", "handicrafts", 180, "piece", 1000,
     "Vellore, Tamil Nadu",
     "Handmade terracotta pots, planters and decorative items. Natural clay, kiln-fired. Eco-friendly. Bulk pricing for garden stores and home decor brands.",
     img("terracotta,pottery,clay", 148)),

    # ── HEALTHCARE & PHARMA ───────────────────────────────────────────────
    ("Moringa Leaf Powder (Organic)", "healthcare", 380, "kg", 1000,
     "Salem, Tamil Nadu",
     "Certified organic moringa powder. 40+ nutrients. No additives. Spray-dried for maximum nutrition. Supplied to health food brands and nutraceutical companies.",
     img("moringa,powder,green", 162)),

    ("Neem Leaf Powder (Pure)", "healthcare", 185, "kg", 2000,
     "Coimbatore, Tamil Nadu",
     "Pure neem leaf powder. Air-dried and finely milled. Antibacterial properties. Used in herbal toothpaste, skincare and Ayurvedic formulations.",
     img("neem,herb,green", 166)),

    ("Triphala Churna (Ayurvedic)", "healthcare", 220, "kg", 1500,
     "Coimbatore, Tamil Nadu",
     "Classic Ayurvedic Triphala churna. Equal parts amla, haritaki and bibhitaki. GMP-certified manufacturing. Supplied to Ayurvedic pharmacies and brands.",
     img("ayurveda,herbs,powder", 172)),

    # ── PLASTICS & PACKAGING ──────────────────────────────────────────────
    ("Corrugated Cardboard Boxes (5-ply)", "plastics", 45, "piece", 20000,
     "Chennai, Tamil Nadu",
     "5-ply corrugated shipping boxes. Sizes from A4 to 24x18x18 inch. Custom printing available. Supplied to e-commerce, food and garment industries.",
     img("box,corrugated,cardboard", 179)),

    ("Food-Grade PP Containers (1L)", "plastics", 22, "piece", 50000,
     "Chennai, Tamil Nadu",
     "Microwaveable PP containers with airtight lids. 1L capacity. BPA-free, food-safe. Supplied to meal kit companies, dairies and caterers.",
     img("container,food,plastic", 182)),

    ("PP Woven Sacks (50 kg capacity)", "plastics", 18, "piece", 50000,
     "Ahmedabad, Gujarat",
     "Polypropylene woven sacks. 50 kg capacity. Laminated and unlaminated options. Custom printing available. Used for cement, rice and feed packing.",
     img("sack,woven,packaging", 178)),
]

DEMO_SELLER   = {"phone": "9999999999", "name": "Koyambedu Agro Traders"}
REAL_SELLER   = {"phone": "9360866037", "name": "Sri Murugan Wholesale"}


def main():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    for stmt in SCHEMA.strip().split(";"):
        s = stmt.strip()
        if s:
            cur.execute(s)
    conn.commit()

    # Create both sellers
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

    # Mark demo seller as verified so listings appear
    cur.execute(
        "UPDATE users SET subscription_status = 'verified' WHERE phone = ?",
        (DEMO_SELLER["phone"],),
    )
    conn.commit()

    inserted = 0
    for i, (title, category, price, unit, real_qty, location, desc, img_url) in enumerate(PRODUCTS):
        is_demo = (i % 2 == 0)
        seller_id   = demo_id if is_demo else real_id
        store_name  = DEMO_SELLER["name"] if is_demo else REAL_SELLER["name"]
        quantity    = 0 if is_demo else real_qty
        description = desc + DEMO_NOTE if is_demo else desc

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
    print(f"Seeded {inserted} listings ({inserted // 2} demo + {inserted - inserted // 2} real)")


if __name__ == "__main__":
    main()
