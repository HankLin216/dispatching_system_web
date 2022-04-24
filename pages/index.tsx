import React, { useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@material-ui/styles";
import { Button, Theme } from "@mui/material";
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
import { DeleteData, PostData, Response as ProjectResponse } from "@modules/api/Project";
import { Response as TaskResponse } from "@modules/api/Task";
import { Project, Task } from "@modules/mysql";
import type { Overwrite } from "lib/typeHelper";
import moment from "moment";
import Divider from "@mui/material/Divider";
import {
  DataGrid,
  GridColDef,
  GridSelectionModel,
  GridCallbackDetails,
  GridCellParams,
  MuiEvent,
} from "@mui/x-data-grid";
import { useAppSelector } from "@redux/hook";
import { Actions } from "@redux/slices/indexSlice";
import { wrapper } from "@redux/store";
import { GetProjectList } from "./api/projects";
import { useDispatch } from "react-redux";
import { GetTaskListByProjectID } from "./api/tasks";

const useTabPanelStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(2),
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

const projectColumns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "ProjectName", headerName: "Project Name", width: 150 },
  { field: "Status", headerName: "Status", width: 150 },
  { field: "UpdateDate", headerName: "Update Date", width: 200 },
  { field: "CreateDate", headerName: "Create Date", width: 200 },
];

const taskColumns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "pjid", headerName: "PJID", width: 80 },
  { field: "TaskName", headerName: "Task Name", width: 150 },
  { field: "Status", headerName: "Status", width: 150 },
  { field: "Memo", headerName: "Memo", width: 150 },
  { field: "UpdateDate", headerName: "Update Date", width: 200 },
  { field: "CreateDate", headerName: "Create Date", width: 200 },
];

function ProjectPanel() {
  const classes = useTabPanelStyles();
  const dispatch = useDispatch();
  const { ProjectList, SelectedTaskList } = useAppSelector((s) => s.index);

  const [selectionModel, setSelectionModel] = React.useState<GridSelectionModel>([]);

  const handleDialogClickOpen = () => {
    dispatch(Actions.CHANGE_ADDDIALOG_STATUS());
  };

  const handleOnDeleteProjectClick = async () => {
    // if nothing selected
    if (selectionModel.length === 0) {
      return;
    }
    // delete
    let deleteData: DeleteData = {
      ProjectIds: selectionModel as number[],
    };
    let { result }: ProjectResponse = await fetch("http://localhost:3000/api/projects", {
      method: "Delete",
      body: JSON.stringify(deleteData),
    }).then((res) => res.json());

    if (!result) {
      // fail
      return;
    }

    // update project and task list
    let firstPjid = null;
    // get all projects
    let pjList: Overwrite<Project, { CreateDate: string; UpdateDate: string }>[] =
      await getProjectData();
    dispatch(Actions.UPDATE_PJLIST(pjList));

    if (pjList.length === 0) {
      // empty
      dispatch(Actions.UPDATE_SELECTED_TKLIST([]));
    } else if (
      SelectedTaskList.length === 0 ||
      (SelectedTaskList.length !== 0 && selectionModel.includes(SelectedTaskList[0].pjid))
    ) {
      // get the first pjid
      firstPjid = pjList[0].id;
      // get the taskList
      let tkList: Overwrite<Task, { CreateDate: string; UpdateDate: string }>[] =
        await getTaskDataByProjectID(firstPjid.toString());
      dispatch(Actions.UPDATE_SELECTED_TKLIST(tkList));
    }
  };

  function onProjectSelectChange(
    newSelectionModel: GridSelectionModel,
    details: GridCallbackDetails,
  ) {
    setSelectionModel(newSelectionModel);
  }

  function onProjectTableCellClick(params: GridCellParams, event: MuiEvent<React.MouseEvent>) {
    event.defaultMuiPrevented = true;
    let selectProjectId: number = params.row.id;
    // update task list
    getTaskDataByProjectID(selectProjectId.toString()).then((data) => {
      dispatch(Actions.UPDATE_SELECTED_TKLIST(data));
    });
  }

  return (
    <>
      <Grid container spacing={2} className={classes.root}>
        <Grid container item xs={12} spacing={2}>
          <Grid item>
            <Typography variant="h5">Project Lists</Typography>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={handleDialogClickOpen}>
              ADD PROJECT
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="error" onClick={handleOnDeleteProjectClick}>
              DELETE PROJECT
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12} style={{ height: 350 }}>
          <DataGrid
            columns={projectColumns}
            rows={ProjectList}
            checkboxSelection={true}
            onSelectionModelChange={onProjectSelectChange}
            onCellClick={onProjectTableCellClick}
          ></DataGrid>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid container item xs={12} spacing={2}>
          <Grid item>
            <Typography variant="h5">Task Lists</Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} style={{ height: 400 }}>
          <DataGrid columns={taskColumns} rows={SelectedTaskList}></DataGrid>
        </Grid>
      </Grid>
      <AddProjectDialog></AddProjectDialog>
    </>
  );
}

async function getProjectData(): Promise<
  Overwrite<Project, { CreateDate: string; UpdateDate: string }>[]
> {
  // get data
  let fakePjData: Overwrite<Project, { CreateDate: string; UpdateDate: string }>[] = await fetch(
    "http://localhost:3000/api/projects",
  ).then((res) => res.json());
  let pjList = fakePjData.map((r) => {
    return {
      ...r,
      CreateDate: r.CreateDate.replace("T", " ").replace("Z", ""),
      UpdateDate: r.UpdateDate.replace("T", " ").replace("Z", ""),
    };
  });

  return pjList;
}

async function getTaskDataByProjectID(pjid: string) {
  // get data
  let fakeTkData: Overwrite<Task, { CreateDate: string; UpdateDate: string }>[] = await fetch(
    "http://localhost:3000/api/tasks?" +
      new URLSearchParams({
        ProjectID: pjid,
      }),
  ).then((res) => res.json());
  let tkList = fakeTkData.map((r) => {
    return {
      ...r,
      CreateDate: r.CreateDate.replace("T", " ").replace("Z", ""),
      UpdateDate: r.UpdateDate.replace("T", " ").replace("Z", ""),
    };
  });
  return tkList;
}

const AddProjectDialog = () => {
  const AddProjectDialogStatus = useAppSelector((state) => state.index.AddProjectDialogStatus);
  const dispatch = useDispatch();

  // const [dialogOpen, setDialogOpen] = React.useState(false);
  const [projectName, setProjectName] = React.useState("");
  const [taskName, setTaskName] = React.useState<string[]>([]);

  const handleProjectNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(event.target.value);
  };

  const handleDialogClickConfirm = async () => {
    let data: PostData = {
      ProjectName: projectName,
      TaskNameList: taskName,
    };

    // Add data
    let { result, insertProjectID, message }: ProjectResponse = await fetch(
      "http://localhost:3000/api/projects",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ).then((res) => res.json());

    // get the insert task data
    let taskList: Overwrite<Task, { CreateDate: string; UpdateDate: string }>[] = [];
    if (result && insertProjectID !== undefined) {
      // update data
      let newPjData = await getProjectData();
      taskList = await getTaskDataByProjectID(insertProjectID?.toString());

      dispatch(Actions.UPDATE_PJLIST(newPjData));
      dispatch(Actions.UPDATE_SELECTED_TKLIST(taskList));
    }

    handleDialogClose();
  };

  const handleDialogClose = () => {
    setProjectName("");
    setTaskName([]);
    dispatch(Actions.CHANGE_ADDDIALOG_STATUS());
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
    <Dialog open={AddProjectDialogStatus} onClose={handleDialogClose} maxWidth={"sm"} fullWidth>
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
  );
};

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
    <div style={{ height: "100%" }}>
      <Container maxWidth="lg" style={{ height: "100%" }}>
        <NavTabs></NavTabs>
      </Container>
    </div>
  );
};

// server side code
export const getServerSideProps = wrapper.getServerSideProps((store) => async ({ req }) => {
  // get data
  let pjList: Project[] = await GetProjectList();
  // handle date type (to string)
  let fakePjData = pjList.map((r) => {
    return {
      ...r,
      CreateDate: moment(r.CreateDate).format("yyyy-MM-DD HH:mm:ss"),
      UpdateDate: moment(r.UpdateDate).format("yyyy-MM-DD HH:mm:ss"),
    };
  });

  if (fakePjData.length !== 0) {
    // update project list
    store.dispatch(Actions.SERVER_INIT_PROJECTLIST(fakePjData));
  }

  // get the default task list
  let taskList = store.getState().index.SelectedTaskList;
  if (taskList.length === 0 && fakePjData.length !== 0) {
    let defaultPjid = fakePjData[0].id;
    let tkList: Task[] = await GetTaskListByProjectID(defaultPjid);
    // handle data type (to string)
    let fakeTkData = tkList.map((r) => {
      return {
        ...r,
        CreateDate: moment(r.CreateDate).format("yyyy-MM-DD HH:mm:ss"),
        UpdateDate: moment(r.UpdateDate).format("yyyy-MM-DD HH:mm:ss"),
      };
    });

    // update selected task list
    store.dispatch(Actions.SERVER_INIT_TASKLIST(fakeTkData));
  }

  return {
    props: {},
  };
});

export default Home;
