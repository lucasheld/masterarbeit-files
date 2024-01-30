import React, {useState} from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, {createFilterOptions} from "@mui/material/Autocomplete";

const filter = createFilterOptions();

const MultiChipInputComponent = React.forwardRef(({onChange, name, label, value, id, title, disabled}, ref) => {
    const [options, setOptions] = useState([]);

    // const tags = useStoreTags(state => state.tags);
    //
    // useEffect(() => {
    //     setOptions(tags);
    // }, []);
    //
    // useEffect(() => {
    //     setOptions(tags)
    // }, [tags])

    return (
        <Autocomplete
            value={value}
            multiple
            onChange={(event, newValue, reason, details) => {
                switch (reason) {
                    case "selectOption":
                    case "createOption":
                        if (details.option.create) {
                            let valueList = value;
                            valueList.push(details.option.name);
                            onChange(valueList);
                        } else {
                            onChange(newValue);
                        }
                        break;
                    case "removeOption":
                        onChange(newValue);
                        break;
                    case "clear":
                        onChange([]);
                        break;
                    default:
                        console.error("unknown reason: ", reason);
                }
            }}
            filterSelectedOptions
            filterOptions={(options, params) => {
                const filtered = filter(options, params);

                const {inputValue} = params;
                // Suggest the creation of a new value
                const isExisting = options.some(option => inputValue === option.name);
                if (inputValue !== "" && !isExisting) {
                    filtered.push({
                        name: inputValue,
                        label: `Add "${inputValue}"`,
                        create: true
                    });
                }

                return filtered;
            }}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            id={id}
            options={options}
            getOptionLabel={option => {
                // Value selected with enter, right from the input
                if (typeof option === "string") {
                    return option;
                }
                // Add "xxx" option created dynamically
                if (option.label) {
                    return option.name;
                }
                // Regular option
                return option.name;
            }}
            renderOption={(props, option) => <li {...props}>{option.create ? option.label : option.name}</li>}
            freeSolo
            renderInput={params => (
                <TextField
                    {...params}
                    margin="dense"
                    label={title}
                />
            )}
            fullWidth
            disabled={disabled}
        />
    );
});

export default MultiChipInputComponent;
