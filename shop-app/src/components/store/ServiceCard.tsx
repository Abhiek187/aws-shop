import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@mui/material";
import React from "react";
import AWSService from "../../types/AWSService";

type ServiceProps = {
  service: AWSService;
};

const ServiceCard: React.FC<ServiceProps> = ({ service }) => {
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {service.Id}
        </Typography>
        <Typography variant="h5" component="div">
          {service.Name}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {service.Description}
        </Typography>
        <Typography variant="body2">
          Category: {service.Category}
          <br />
          Price: ${service.Price}
        </Typography>
        <Typography>Free Tier: {service.FreeTier}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" className="text-teal-600">
          {service.Unit}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ServiceCard;
