/* eslint-disable react/prop-types */
import React from "react";
import { useRef } from "react";
import {
  LineChart as CustomLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

// eslint-disable-next-line react/prop-types
const LineChart = ({
  data,
  lineColor = "#8884d8",
  xAxisKey = "name",
  lineDataKey = "uv",
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
}) => {
  const [width, setWidth] = React.useState(600);
  const [height, setHeight] = React.useState(300);
  const divRef = useRef();
  React.useEffect(() => {
    if (divRef.current) {
      setWidth(divRef.current.offsetWidth);
      setHeight(divRef.current.offsetHeight);
    }
  }, [divRef]);
  return (
    <div className="block w-full h-full" ref={divRef}>
      <CustomLineChart
        width={width}
        height={height}
        data={data}
        margin={margin}
      >
        <Line type="monotone" dataKey={lineDataKey} stroke={lineColor} />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
      </CustomLineChart>
    </div>
  );
};

export default LineChart;
