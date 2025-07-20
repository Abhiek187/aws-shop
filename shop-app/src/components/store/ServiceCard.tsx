import { AutoAwesome } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Divider,
  Typography,
} from "@mui/material";
import { yellow } from "@mui/material/colors";
import pluralize from "pluralize";

import AWSService from "../../types/AWSService";
import { commaFormat, dollarFormat } from "../../utils/number";
import { usePublishEventMutation } from "../../services/store";
import { storeEvent } from "../../utils/analytics";

type ServiceProps = {
  service: AWSService;
};

const ServiceCard = ({ service }: Readonly<ServiceProps>) => {
  // No need to check the result of the event API
  const [publishEvent] = usePublishEventMutation();

  const publishServiceCardEvent = () => {
    void publishEvent(
      storeEvent({
        serviceName: service.Name,
      })
    );
  };

  return (
    <Card sx={{ minWidth: 275 }}>
      {/* Icon source: https://aws.amazon.com/architecture/icons/ */}
      <CardMedia
        component="img"
        height="64"
        image={`/icons/${service.Name.replaceAll(" ", "-")}.svg`}
        alt={service.Name}
      />
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
        <Button size="small" onClick={publishServiceCardEvent}>
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
