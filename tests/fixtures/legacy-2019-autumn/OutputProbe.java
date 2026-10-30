import java.io.*;
import java.lang.reflect.*;
import java.util.*;
import java.util.concurrent.*;
public class OutputProbe {
  static final class Capture extends PrintStream {
    final CountDownLatch delivered;
    Capture(ByteArrayOutputStream b, int n) throws Exception { super(b,true,"UTF-8"); delivered=new CountDownLatch(n); }
    @Override public void println(String s) { super.println(s); if(s.startsWith("phone:")||s.startsWith("tablet:")) delivered.countDown(); }
  }
  static Object field(Notifier n,String key) throws Exception { Field f=Notifier.class.getDeclaredField(key); f.setAccessible(true); return f.get(n); }
  static void check(boolean b,String m) { if(!b) throw new AssertionError(m); }
  public static void main(String[] args) throws Exception {
    int retained=Integer.parseInt(args[0]),batch=Integer.parseInt(args[1]),mapping=Integer.parseInt(args[2]);
    String[][] pairs={{"Taro","Taro"},{"Taro","Jiro"},{"Jiro","Taro"}};
    String[] users=pairs[mapping],devices={"phone","tablet"};
    String[][] messageCases={{"You have a message."},{"You have a message.","More mail 2."},{"You have a message.","More mail 2.","More mail 3."},{"You have a message.","More mail 2.","More mail 3.","More mail 4."}};
    String[] messages=messageCases[batch];int targets=0;for(String user:users)if(user.equals("Taro"))targets++;
    Set<Thread> before=Thread.getAllStackTraces().keySet();PrintStream real=System.out;ByteArrayOutputStream bytes=new ByteArrayOutputStream();Capture out=new Capture(bytes,targets);System.setOut(out);
    Notifier notifier=Notifier.getInstance();Object lock=field(notifier,"lock");Method create=Tester.class.getDeclaredMethod("createUserMobileDevice",String.class,String.class);create.setAccessible(true);
    synchronized(lock) {
      create.invoke(null,users[0],devices[0]);create.invoke(null,users[1],devices[1]);
      for(String message:messages)notifier.send("Taro",message);
    }
    List<Thread> owned=new ArrayList<>();for(Thread t:Thread.getAllStackTraces().keySet())if(!before.contains(t)&&!t.isDaemon()&&t!=Thread.currentThread())owned.add(t);
    check(owned.size()==2,"two actual Tester worker threads");check(out.delivered.await(3,TimeUnit.SECONDS),"actual callbacks completed");
    long deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(3);boolean waiting=false;while(System.nanoTime()<deadline){waiting=true;for(Thread t:owned)waiting &= t.getState()==Thread.State.TIMED_WAITING;if(waiting)break;Thread.sleep(1);}
    check(waiting,"actual device monitors waiting before shutdown");notifier.shutdown();for(Thread t:owned){t.join(5000);check(!t.isAlive(),"owned thread terminated");}
    String captured=bytes.toString("UTF-8");Map<?,?> registry=(Map<?,?>)field(notifier,"userMobileDevices");Map<?,?> pending=(Map<?,?>)field(notifier,"messagesToDeliver");check(pending.isEmpty(),"pending cleared");if(retained==0)check(registry.isEmpty(),"original registry removed");else{check(registry.size()==new HashSet<String>(Arrays.asList(users)).size(),"retained user keys");for(Object value:registry.values())check(((List<?>)value).isEmpty(),"retained device lists emptied");}
    notifier.send("Taro","You have 2 messages.");Thread.sleep(10);check(bytes.toString("UTF-8").equals(captured),"post-shutdown source call silent");check(pending.isEmpty(),"post-shutdown no queues");System.setOut(real);real.print(captured);
    List<String> observed=new ArrayList<>(),terminated=new ArrayList<>();for(String line:captured.split("\\R")){if(line.startsWith("phone:")||line.startsWith("tablet:"))observed.add(line);else if(line.startsWith("Terminating "))terminated.add(line);else check(line.isEmpty(),"unexpected line");}
    List<String> expected=new ArrayList<>();for(int i=0;i<2;i++)if(users[i].equals("Taro"))expected.add(devices[i]+": "+Arrays.asList(messages).toString());
    Collections.sort(observed);Collections.sort(expected);check(observed.equals(expected),"notification format mismatch: expected exact colon + ASCII space1; observed="+observed+" expected="+expected);
    List<String> end=Arrays.asList("Terminating "+users[0]+"'s phone","Terminating "+users[1]+"'s tablet");Collections.sort(terminated);Collections.sort(end);check(terminated.equals(end),"termination literals preserved");
    real.println("PROBE_PASS "+retained+"/"+batch+"/"+mapping+" notifications="+observed.size());
  }
}
