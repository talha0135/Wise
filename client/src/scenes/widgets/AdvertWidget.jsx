import { useEffect, useState } from "react";
import { Link, Typography, useTheme } from "@mui/material";
import FlexBetween from "../../components/FlexBetween";
import WidgetWrapper from "../../components/WidgetWrapper";

const svgAd = (title, c1, c2) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
      <rect width="600" height="360" fill="url(#g)"/>
      <circle cx="480" cy="90" r="110" fill="rgba(255,255,255,0.18)"/>
      <circle cx="120" cy="300" r="140" fill="rgba(255,255,255,0.12)"/>
      <text x="300" y="195" font-family="Arial, sans-serif" font-size="48" font-weight="700" text-anchor="middle" fill="#ffffff">${title}</text>
    </svg>`
  )}`;

const ADS = [
  {
    name: "MikaCosmetics",
    site: "mikacosmetics.com",
    text: "Your pathway to stunning and immaculate beauty, made sure your skin is exfoliating and shining like light.",
    image: svgAd("MikaCosmetics", "#ff9a9e", "#c471f5"),
  },
  {
    name: "TeaLeaf Co.",
    site: "tealeafco.com",
    text: "Small-batch teas for slow mornings and long conversations. Spill the tea, sip the tea.",
    image: svgAd("TeaLeaf Co.", "#11998e", "#38ef7d"),
  },
];

const AdvertWidget = () => {
  const { palette } = useTheme();
  const dark = palette.neutral.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ADS.length), 8000);
    return () => clearInterval(id);
  }, []);

  const ad = ADS[index];

  return (
    <WidgetWrapper>
      <FlexBetween>
        <Typography color={dark} variant="h5" fontWeight="500">
          Sponsored
        </Typography>
        <Link
          href="mailto:ads@wise.example?subject=Advertise%20on%20WISE"
          underline="hover"
          sx={{ color: medium }}
        >
          Create Ad
        </Link>
      </FlexBetween>
      <img
        width="100%"
        height="auto"
        alt="advert"
        src={ad.image}
        style={{ borderRadius: "0.75rem", margin: "0.75rem 0" }}
      />
      <FlexBetween>
        <Typography color={main}>{ad.name}</Typography>
        <Typography color={medium}>{ad.site}</Typography>
      </FlexBetween>
      <Typography color={medium} m="0.5rem 0">
        {ad.text}
      </Typography>
    </WidgetWrapper>
  );
};

export default AdvertWidget;
