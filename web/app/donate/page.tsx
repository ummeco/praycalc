import DonatePage from "../../../../ummat/shared/donate/src/DonatePage";

export const metadata = {
  title: "Support PrayCalc — Keep Islamic Knowledge Free",
  description: "Help keep PrayCalc free for Muslims worldwide. Your donation supports development and hosting.",
};

export default function PrayCalcDonatePage() {
  return (
    <DonatePage
      designation="praycalc"
      productName="PrayCalc"
      tagline="Support PrayCalc — keep prayer times free for every Muslim"
      accentColor="#79C24C"
      checkoutApiPath="/api/donations/checkout"
    />
  );
}
