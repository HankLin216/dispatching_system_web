import React, { useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@material-ui/styles";
import MaterialTable from "material-table";
import { Theme } from "@mui/material";
import tableIcons from "../utility/material-table-icon";
import type { SampleInfo } from "../modules/@sample";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const useTabPanelStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(5),
  },
}));

const useMonitorTableStyles = makeStyles((theme: Theme) => ({
  refresh: {
    animation: `$fade_out 3000ms`,
  },
  "@keyframes fade_out": {
    "0%": {
      color: "red",
    },
    "100%": {
      color: "inherit",
    },
  },
}));

function TesterStatusPanel() {
  const classes = useTabPanelStyles();
  const tableClasses = useMonitorTableStyles();
  const [sampleData, setSampleData] = useState<SampleInfo[]>([]);
  const prevSampleData = useRef<SampleInfo[]>([]);

  useEffect(() => {
    // fetch data
    async function getAllSampleInfos() {
      var sampleInfos: SampleInfo[] = await fetch("api/samples/getAllSamples").then((res) =>
        res.json(),
      );
      setSampleData(sampleInfos);
    }
    // timer
    getAllSampleInfos(); // first time
    var updateSampleStatusTimer = setInterval(() => {
      getAllSampleInfos();
    }, 10 * 1000);

    return () => clearInterval(updateSampleStatusTimer);
  }, []);

  useEffect(() => {
    prevSampleData.current = sampleData;
  }, [sampleData]);

  function sameAsPrevious(value: any, rowIdx: number, key: string): boolean {
    if (prevSampleData.current.length === 0) return false;

    return value === prevSampleData.current[rowIdx][key as keyof SampleInfo] ? true : false;
  }

  return (
    <div className={classes.root}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sample ID</TableCell>
              <TableCell>Project ID</TableCell>
              <TableCell>Task ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>UpdateTime</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((d, row_idx) => (
              <TableRow key={row_idx}>
                {Object.keys(d).map((key) => {
                  var currentValue = d[key as keyof SampleInfo];
                  var isSameValue = sameAsPrevious(currentValue, row_idx, key);
                  return (
                    <TableCell
                      key={
                        !isSameValue ? `${row_idx}_${key}_${Math.random()}` : `${row_idx}_${key}`
                      }
                      className={!isSameValue ? tableClasses.refresh : undefined}
                    >
                      {d[key as keyof SampleInfo]}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function ProjectPanel() {
  const classes = useTabPanelStyles();
  const [data, setData] = useState();

  return (
    <div className={classes.root}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Dessert (100g serving)</TableCell>
              <TableCell align="right">Calories</TableCell>
              <TableCell align="right">Fat&nbsp;(g)</TableCell>
              <TableCell align="right">Carbs&nbsp;(g)</TableCell>
              <TableCell align="right">Protein&nbsp;(g)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* {rows.map((row) => (
              <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.calories}</TableCell>
                <TableCell align="right">{row.fat}</TableCell>
                <TableCell align="right">{row.carbs}</TableCell>
                <TableCell align="right">{row.protein}</TableCell>
              </TableRow>
            ))} */}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

const useNavTabsStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
  },
  tabsBox: {
    borderBottom: "1px solid",
    borderColor: "black",
  },
});

const NavTabs = () => {
  const classes = useNavTabsStyles();
  const [value, setValue] = React.useState<number>(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function renderPanel(index: number) {
    switch (index) {
      case 0:
        return <ProjectPanel></ProjectPanel>;
      case 2:
        return <TesterStatusPanel></TesterStatusPanel>;
    }
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.tabsBox}>
        <Tabs value={value} variant="fullWidth" onChange={handleChange}>
          <Tab label="Project" />
          <Tab label="Assign" />
          <Tab label="Sample Status" />
        </Tabs>
      </Box>
      {renderPanel(value)}
    </Box>
  );
};

const Home: NextPage = () => {
  return (
    <div style={{ height: "100%", backgroundColor: "WhiteSmoke" }}>
      <Container maxWidth="md" style={{ height: "100%" }}>
        <NavTabs></NavTabs>
      </Container>
    </div>
  );
};

export default Home;
