/* eslint-disable react/display-name */
import React from "react";

// eslint-disable-next-line react/prop-types
const CustomScrollbar = React.forwardRef(({ ...props }, ref) => {
    return <div style={{...props?.style}} className="overflow-auto hover:overflow-scroll" ref={ref} {...props} />
  })

export default CustomScrollbar;
