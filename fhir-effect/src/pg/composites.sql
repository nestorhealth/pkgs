CREATE TYPE Attachment AS (
    contentType code,
    language code,
    data base64Binary,
    url url,
    size unsignedInt,
    hash base64Binary,
    title string,
    creation dateTime,
);

CREATE TYPE Coding AS (
    system uri,
    version string,
    code code,
    display string,
    userSelected boolean
);

CREATE TYPE CodeableConcept AS (
    coding Coding,
    text string
);


CREATE TYPE Quantity AS (
    value decimal,
    comparator code,
    unit string,
    system uri,
    code code,
);

CREATE TYPE SimpleQuantity AS (
    value decimal,
    unit string,
    system uri,
    code code
);

CREATE TYPE Money AS (
    value decimal,
    currency code
);

CREATE TYPE Range AS (
    low SimpleQuantity,
    high SimpleQuantity
);

CREATE TYPE Ratio AS (
    numerator Quantity,
    denominator Quantity
);

CREATE TYPE Period AS (
    start dateTime,
    end dateTime
);

CREATE TYPE SampledData AS (
    origin SimpleQuantity,
    period decimal
);