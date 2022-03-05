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
import { Button, Theme } from "@mui/material";
import tableIcons from "../utility/material-table-icon";
import type { SampleInfo } from "../modules/@sample";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { PostData } from "@modules/api/Project";
import { Project } from "@entities";
import type { Overwrite } from "utility/typeHelper";
import moment from "moment";

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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const taskNames = [
  "陽春麵",
  "牛肉獅子頭",
  "臭豆腐",
  "螞蟻上樹",
  "蚵仔煎",
  "佛跳牆",
  "豆魚油麵",
  "九層塔什錦麵",
  "滷蛋",
  "東坡肉飯",
  "地瓜稀飯",
  "蚵仔麵線",
];

function ProjectPanel() {
  const classes = useTabPanelStyles();
  const [data, setData] = useState<Project[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [projectName, setProjectName] = React.useState("");
  const [taskName, setTaskName] = React.useState<string[]>([]);

  useEffect(() => {
    async function initProjectData() {
      await getProjectData();
    }
    initProjectData();
  }, []);

  const handleProjectNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(event.target.value);
  };

  const handleDialogClickConfirm = async () => {
    let data: PostData = {
      ProjectName: projectName,
      TaskNameList: taskName,
    };

    // add data
    let res: boolean = await fetch("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((res) => res.json());

    handleDialogClose();

    await getProjectData();
  };

  async function getProjectData() {
    // get data
    let fakeData = await fetch("http://localhost:3000/api/projects").then((res) => res.json());
    // handle date type
    let data: Project[] = fakeData.map(
      (p: Overwrite<Project, { CreateDate: string; UpdateDate: string }>) => {
        return { ...p, CreateDate: new Date(p.CreateDate), UpdateDate: new Date(p.UpdateDate) };
      },
    );

    setData(data);
  }

  const handleDialogClickOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setProjectName("");
    setTaskName([]);
    setDialogOpen(false);
  };

  const handleSelectTaskChange = (event: SelectChangeEvent<typeof taskName>) => {
    const {
      target: { value },
    } = event;
    setTaskName(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value,
    );
  };

  return (
    <>
      <Grid container spacing={2} className={classes.root}>
        <Grid item xs={12}>
          <Button variant="outlined" onClick={handleDialogClickOpen}>
            ADD PROJECT
          </Button>
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Project ID</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Update Date</TableCell>
                  <TableCell>Create Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow
                    key={row.ProjectName}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.id}
                    </TableCell>
                    <TableCell>{row.ProjectName}</TableCell>
                    <TableCell>{row.Status}</TableCell>
                    <TableCell>{moment(row.UpdateDate).format("yyyy-MM-DD HH:mm:ss")}</TableCell>
                    <TableCell>{moment(row.CreateDate).format("yyyy-MM-DD HH:mm:ss")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth={"sm"} fullWidth>
        <DialogTitle>Create Project</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item sm={12}>
              <DialogContentText>Create serveral tasks randomly.</DialogContentText>
            </Grid>
            <Grid item sm={12}>
              <TextField
                autoFocus
                margin="dense"
                id="ProjectName"
                label="Project Name"
                type="email"
                fullWidth
                variant="standard"
                value={projectName}
                onChange={handleProjectNameChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FormatColorTextIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item sm={12}>
              <FormControl variant={"standard"} sx={{ width: "100%" }}>
                <InputLabel id="task-multiple-checkbox-label">Tasks</InputLabel>
                <Select
                  labelId="task-multiple-checkbox-label"
                  id="task-multiple-checkbox"
                  multiple
                  value={taskName}
                  onChange={handleSelectTaskChange}
                  renderValue={(selected) => selected.join(", ")}
                  MenuProps={MenuProps}
                >
                  {taskNames.map((name) => (
                    <MenuItem key={name} value={name}>
                      <Checkbox checked={taskName.indexOf(name) > -1} />
                      <ListItemText primary={name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogClickConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
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
