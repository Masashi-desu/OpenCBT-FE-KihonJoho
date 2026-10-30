export const spring2019Pm11Profiles=['legacy-2019-spring-pm11-maze','legacy-2019-spring-pm11-program','legacy-2019-spring-pm11-bank','legacy-2019-spring-pm11-history']as const;
export const spring2019Pm11DirectionNames=['NORTH','EAST','SOUTH','WEST'];
export function spring2019Pm11Maze(values:number[]){if(values.length!==2||!values.every(Number.isInteger)||values[0]<0||values[0]>2||values[1]<0||values[1]>3)throw Error('PARAMETER_CONSTRAINT');const [westBranch,northBranch]=values,rows=['*******','*******','*S*****','*.....*','*****.*','*G....*','*******'].map(s=>s.split(''));
 for(const [i,[x,y]]of[[1,1],[2,1]].entries())if(i<westBranch)rows[y][x]='.';
 for(const [i,[x,y]]of[[4,2],[4,1],[5,1]].entries())if(i<northBranch)rows[y][x]='.';
 return rows.map(r=>r.join(''));
}
export function spring2019Pm11Walk(values:number[]){const rows=spring2019Pm11Maze(values),moves:number[]=[],dx=[0,1,0,-1],dy=[-1,0,1,0];let x=1,y=2,direction=0,guard=0;
 while(rows[y][x]!=='G'){if(guard++>128)throw Error('PARAMETER_CONSTRAINT');direction=(direction+3)%4;let turn=0;while(rows[y+dy[direction]][x+dx[direction]]==='*'){direction=(direction+1)%4;if(turn++>3)throw Error('PARAMETER_CONSTRAINT');}x+=dx[direction];y+=dy[direction];moves.push(direction);}
 const reduced:number[]=[];for(const move of moves){if(reduced.length&&reduced.at(-1)===(move+2)%4)reduced.pop();else reduced.push(move);}return{moves,reduced,location:[x,y]};
}
const mazeProgram=String.raw`public class Maze {
    private final String mazeData;
    private final int width;
    private final Location startLocation;

    public Maze(String mazeData, int width) {
        this.mazeData = mazeData;
        this.width = width;
        startLocation = locationOf('S');
    }

    public Location getStartLocation() { return startLocation; }

    public boolean isGoal(Location loc) {
        return mazeData.charAt(loc.y ［a］ width + loc.x) == 'G';
    }

    public boolean isBlank(Location loc) {
        return mazeData.charAt(loc.y ［a］ width + loc.x) != '*';
    }

    private Location locationOf(char c) {
        int index = mazeData.indexOf(c);
        return new Location(index ［b］ width, index / width);
    }
}`;
const pieceProgram=String.raw`import java.util.ArrayList;
import java.util.List;

public class Piece {
    private final Maze maze;
    private Location location;
    private Direction direction = Direction.NORTH;
    private final List<Direction> history = new ArrayList<>();

    public Piece(Maze maze) {
        this.maze = maze;
        location = maze.getStartLocation();
    }

    public void turnLeft() { direction = direction.left(); }

    public void turnRight() { direction = direction.right(); }

    public boolean tryStepForward() {
        Location nextLocation = new Location(［c］);
        if (maze.isBlank(nextLocation)) {
            location = nextLocation;
            history.add(direction);
            return true;
        }
        return false;
    }

    public boolean isAtGoal() { return maze.isGoal(location); }

    public List<Direction> getHistory() { return new ArrayList<>(history); }
}`;
const directionProgram=String.raw`public enum Direction {
    NORTH(0, -1), EAST(1, 0), SOUTH(0, 1), WEST(-1, 0);

    public int dx, dy;

    private Direction(int dx, int dy) {
        this.dx = dx;
        this.dy = dy;
    }

    // クラスメソッド values は，この列挙で定義している列挙定数を，
    // 定義順に格納した配列を返す。
    // メソッド ordinal は，この列挙定数の定義順（先頭は0）を返す。
    public Direction left() { return values()[［d］]; }

    public Direction right() { return values()[(ordinal() + 1) % 4]; }
}`;
const locationProgram=String.raw`public class Location {
    public final int x, y;

    public Location(int x, int y) {
        this.x = x;
        this.y = y;
    }
}`;
const reductionProgram=String.raw`for (int i = ［e］; i < history.size(); i++) {
    if (history.get(i - 1) == history.get(i).left().left()) {
        history.remove(［f］);
        history.remove(［f］);
        i = i < 2 ? 0 : i - 2;
    }
}`;
export function spring2019Pm11Programs(values:number[]){const rows=spring2019Pm11Maze(values);const play=String.raw`import java.util.List;

public class PlayMaze {
    public static void main(String... args) {
        Maze maze = new Maze(${rows.map((row,i)=>`"${row}"${i<6?' +':''}`).join('\n                             ')}, 7);
        Piece piece = new Piece(maze);
        while (!piece.isAtGoal()) {
            piece.turnLeft();
            while (!piece.tryStepForward()) {
                piece.turnRight();
            }
        }
        List<Direction> history = piece.getHistory();
α
        System.out.println(history);
    }
}`;return[mazeProgram,pieceProgram,directionProgram,locationProgram,play,reductionProgram];}
export const spring2019Pm11Banks=[['%','&','*','+','-','/','^','|'],['direction','direction.dx, direction.dy','location + direction','location.x + direction.dx, location.y + direction.dy'],['(ordinal() + 3) % 4','(ordinal() + 3) / 4','(ordinal() - 1) % 4','(ordinal() - 1) / 4'],['-1','0','1'],['i','i + 1','i - 1']];
export const spring2019Pm11BankCaptions=['a，bに関する解答群','cに関する解答群','dに関する解答群','eに関する解答群','fに関する解答群'];
export function spring2019Pm11Figure(profile:string,values:number[]){if(!spring2019Pm11Profiles.includes(profile as typeof spring2019Pm11Profiles[number])||values.length!==3)throw Error('PARAMETER_CONSTRAINT');const v=values.slice(0,2),group=values[2],rows=spring2019Pm11Maze(v);if(!Number.isInteger(group)||group<0)throw Error('PARAMETER_CONSTRAINT');if(profile.endsWith('-maze')){if(group!==0)throw Error('PARAMETER_CONSTRAINT');return{kind:'maze' as const,rows};}if(profile.endsWith('-program')){if(group>5)throw Error('PARAMETER_CONSTRAINT');return{kind:'program' as const,text:spring2019Pm11Programs(v)[group]};}if(profile.endsWith('-history')){if(group!==0)throw Error('PARAMETER_CONSTRAINT');return{kind:'history' as const,directions:spring2019Pm11Walk(v).reduced.map(d=>spring2019Pm11DirectionNames[d])};}if(group>4)throw Error('PARAMETER_CONSTRAINT');return{kind:'bank' as const,caption:spring2019Pm11BankCaptions[group],entries:spring2019Pm11Banks[group]};}
