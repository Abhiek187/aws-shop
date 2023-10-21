import { AutoAwesome } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import { yellow } from "@mui/material/colors";
import pluralize from "pluralize";
import React from "react";

import AWSService from "../../types/AWSService";
import { commaFormat, dollarFormat } from "../../utils/number";

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
      <CardActions className="flex justify-around">
        {/* Show the category faded and in all caps */}
        <Typography
          color="text.secondary"
          variant="subtitle2"
          className="uppercase"
        >
          {service.Category}
        </Typography>
        <Button size="small">
          {dollarFormat(service.Price)} per {service.Unit}
        </Button>
      </CardActions>
      {service.FreeTier !== null && service.FreeTier !== undefined && (
        <>
          <Divider />
          <CardActions>
            <AutoAwesome sx={{ color: yellow[700], mr: 1.5 }} />
            <Typography variant="caption">
              {`Free Tier: ${commaFormat(service.FreeTier)} ${pluralize(
                service.Unit,
                service.FreeTier
              )}`}
            </Typography>
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default ServiceCard;
