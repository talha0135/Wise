import { Box } from "@mui/material";
import { assetUrl } from "../api";

const UserImage = ({ image, size = "60px" }) => (
  <Box width={size} height={size} flexShrink={0}>
    <img
      style={{ objectFit: "cover", borderRadius: "50%", background: "#c2c2c2" }}
      width={size}
      height={size}
      alt="user"
      src={assetUrl(image)}
    />
  </Box>
);

export default UserImage;
