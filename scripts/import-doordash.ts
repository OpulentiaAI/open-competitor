import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import fs from "fs";
import path from "path";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Parse CSV line by line
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Cuisine images mapping (use Unsplash food images)
const cuisineImages: Record<string, string> = {
  Vietnamese: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=533&fit=crop",
  Mexican: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=533&fit=crop",
  Pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=533&fit=crop",
  Italian: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=400&h=533&fit=crop",
  Burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=533&fit=crop",
  Chinese: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=533&fit=crop",
  Japanese: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=533&fit=crop",
  Thai: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=533&fit=crop",
  Indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=533&fit=crop",
  Breakfast: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=533&fit=crop",
  Sandwiches: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=533&fit=crop",
  Salads: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=533&fit=crop",
  default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=533&fit=crop",
};

function getImageForCuisine(cuisines: string): string {
  const cuisineList = cuisines.split("|");
  for (const cuisine of cuisineList) {
    if (cuisineImages[cuisine]) {
      return cuisineImages[cuisine];
    }
  }
  return cuisineImages.default;
}

function parsePriceBucket(deliveryFee: number): string {
  if (deliveryFee === 0) return "$";
  if (deliveryFee < 3) return "$";
  if (deliveryFee < 6) return "$$";
  return "$$$";
}

async function importDoorDashData() {
  const csvPath = path.join(__dirname, "..", "doordash.csv");
  const csvData = fs.readFileSync(csvPath, "utf-8");
  const lines = csvData.split("\n");

  // Parse header
  const headers = parseCSVLine(lines[0]);
  console.log(`Found ${lines.length - 1} rows to import`);

  // Track unique restaurants (by loc_number + city)
  const seen = new Set<string>();
  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    // Create unique key
    const key = `${row.loc_number}-${row.searched_city}`;
    if (seen.has(key)) {
      skipped++;
      continue;
    }
    seen.add(key);

    // Parse data
    const name = row.loc_name;
    const city = row.searched_city;
    const state = row.searched_state;
    const cuisines = row.cuisines;
    const rating = parseFloat(row.review_rating);
    const deliveryFee = parseFloat(row.delivery_fee);
    const deliveryTime = parseFloat(row.delivery_time);
    const doordashUrl = row.url;
    const doordashRestaurantId = row.loc_number;

    // Get primary cuisine for meal title
    const primaryCuisine = cuisines.split("|")[0];
    const bestItemTitle = `${primaryCuisine} Special`;
    const bestItemDescription = `Delicious ${primaryCuisine.toLowerCase()} meal`;
    const bestItemPrice = 12 + Math.random() * 18; // Random price between $12-$30

    try {
      await client.mutation(api.restaurants.importRestaurant as any, {
        name,
        city,
        state,
        cuisine: primaryCuisine,
        rating: isNaN(rating) ? undefined : rating,
        priceBucket: parsePriceBucket(deliveryFee),
        deliveryEtaMinutes: isNaN(deliveryTime) ? undefined : Math.round(deliveryTime),
        imageUrl: getImageForCuisine(cuisines),
        bestItemTitle,
        bestItemDescription,
        bestItemPrice: Math.round(bestItemPrice * 100) / 100,
        doordashRestaurantId,
        doordashUrl,
      });

      imported++;
      if (imported % 50 === 0) {
        console.log(`Imported ${imported} restaurants...`);
      }
    } catch (error) {
      console.error(`Failed to import ${name}:`, error);
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped (duplicates): ${skipped}`);
}

importDoorDashData()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Import failed:", error);
    process.exit(1);
  });
