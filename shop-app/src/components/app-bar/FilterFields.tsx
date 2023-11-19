import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  TextField,
  InputAdornment,
  Typography,
  FormControlLabel,
  Checkbox,
  SelectChangeEvent,
} from "@mui/material";
import { ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";

type FilterProps = {
  isMobile: boolean;
};

const FilterFields = ({ isMobile }: FilterProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const minPrice = searchParams.get("min-price") ?? "";
  const maxPrice = searchParams.get("max-price") ?? "";
  const isFreeTier = searchParams.has("free-tier");

  const updateSearchParams = (key: string, value: string) => {
    setSearchParams(
      (params) => {
        // Don't add a query parameter if it's empty
        if (value.length > 0) {
          params.set(key, value);
        } else {
          params.delete(key);
        }

        return params;
      },
      {
        replace: true, // don't undo every character change when navigating back and forward
      }
    );
  };

  const onChangeCategory = (event: SelectChangeEvent) => {
    updateSearchParams("category", event.target.value);
  };

  const onChangeMinPrice = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateSearchParams("min-price", event.target.value);
  };

  const onChangeMaxPrice = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateSearchParams("max-price", event.target.value);
  };

  const onChangeIsFreeTier = (
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setSearchParams(
      (params) => {
        if (checked) {
          params.set("free-tier", "");
        } else {
          params.delete("free-tier");
        }

        return params;
      },
      {
        replace: true,
      }
    );
  };

  // Ensure each label ID is unique on the same page
  const mobilePrefix = isMobile ? "mob-" : "";
  const categoryId = `${mobilePrefix}category`;
  const minPriceId = `${mobilePrefix}min-price`;
  const maxPriceId = `${mobilePrefix}max-price`;
  const freeTierId = `${mobilePrefix}free-tier`;

  return (
    <>
      <FormControl color="secondary" sx={{ m: 1, minWidth: 130 }}>
        <InputLabel id={categoryId}>Category</InputLabel>
        <Select
          labelId={categoryId}
          label="Category"
          value={category}
          onChange={onChangeCategory}
        >
          <MenuItem value="">
            <em>Any</em>
          </MenuItem>
          <MenuItem value="free">Free</MenuItem>
          <MenuItem value="trial">Trial</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <TextField
          id={minPriceId}
          label="Min"
          type="number"
          inputMode="decimal"
          placeholder="0"
          size="small"
          color="secondary"
          value={minPrice}
          onChange={onChangeMinPrice}
          sx={{ width: isMobile ? "10ch" : "15ch" }}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            inputProps: { min: 0 },
          }}
        />
        <Typography> ≤ Price ≤ </Typography>
        <TextField
          id={maxPriceId}
          label="Max"
          type="number"
          inputMode="decimal"
          placeholder="∞"
          size="small"
          color="secondary"
          value={maxPrice}
          onChange={onChangeMaxPrice}
          sx={{ width: isMobile ? "10ch" : "15ch" }}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            inputProps: { min: 0 },
          }}
        />
      </Box>
      <FormControlLabel
        control={
          <Checkbox
            color="secondary"
            id={freeTierId}
            checked={isFreeTier}
            onChange={onChangeIsFreeTier}
          />
        }
        label="Free Tier"
      />
    </>
  );
};

export default FilterFields;
