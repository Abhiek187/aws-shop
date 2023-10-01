import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Divider,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { yellow } from "@mui/material/colors";
import React from "react";

import AWSService from "../../types/AWSService";

type ServiceProps = {
  service: AWSService;
};

const ServiceCard: React.FC<ServiceProps> = ({ service }) => {
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h5" sx={{ textAlign: "center", mb: 1.5 }}>
          {service.Name}
        </Typography>
        <Typography>{service.Description}</Typography>
      </CardContent>
      <CardActions sx={{ display: "flex", justifyContent: "space-around" }}>
        <Typography color="text.secondary">{service.Category}</Typography>
        <Button size="small" className="text-teal-600">
          ${service.Price} per {service.Unit}
        </Button>
      </CardActions>
      {service.FreeTier !== null && service.FreeTier !== undefined && (
        <>
          <Divider />
          <CardActions>
            <AutoAwesomeIcon sx={{ color: yellow[700], mr: 1.5 }} />
            <Typography sx={{ textAlign: "right" }}>
              Free Tier: {service.FreeTier} {service.Unit}s
            </Typography>
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default ServiceCard;
