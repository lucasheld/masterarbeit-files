import {Alert, List, Paper} from "@mui/material";
import TaskComponent from "./TaskComponent";
import {useStoreTasks} from "../store";

const TasksComponent = () => {
    const tasks = useStoreTasks(state => state.tasks);
    const error = useStoreTasks(state => state.error);
    const loaded = useStoreTasks(state => state.loaded);

    return (
        <div>
            {
                loaded &&
                error ?
                    <Alert variant="outlined" severity="error">
                        Tasks could not be loaded
                    </Alert>
                    :
                    tasks.length === 0 ?
                        <Alert variant="outlined" severity="info">
                            No Tasks available
                        </Alert>
                        :
                        <Paper>
                            <List>
                                {
                                    tasks.map(task =>
                                        <TaskComponent
                                            key={task.uuid}
                                            task={task}
                                        />
                                    )
                                }
                            </List>
                        </Paper>
            }
        </div>
    );
};

export default TasksComponent;
