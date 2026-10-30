import java.util.*;import java.lang.reflect.*;
public final class PeerProbe {
 static int checks;static void check(boolean x){checks++;if(!x)throw new AssertionError(checks);}
 static Object field(Notifier n,String key)throws Exception{Field f=Notifier.class.getDeclaredField(key);f.setAccessible(true);return f.get(n);}
 @SuppressWarnings("unchecked") public static void main(String[] args)throws Exception{
 boolean retain=args[0].equals("1");int batch=Integer.parseInt(args[1]);int mapping=Integer.parseInt(args[2]);String[][] mappings={{"Taro","Taro"},{"Taro","Jiro"},{"Jiro","Taro"}};String[] users=mappings[mapping];
 Notifier n=Notifier.getInstance();check(n==Notifier.getInstance());check(Modifier.isVolatile(Notifier.class.getDeclaredField("active").getModifiers()));check((Boolean)field(n,"active"));
 Map<String,List<MobileDevice>> registered=(Map<String,List<MobileDevice>>)field(n,"userMobileDevices");Map<MobileDevice,List<String>> pending=(Map<MobileDevice,List<String>>)field(n,"messagesToDeliver");
 List<MobileDevice> devices=Arrays.asList(new MobileDevice("phone",xs->{}),new MobileDevice("tablet",xs->{}));for(int i=0;i<2;i++)n.register(users[i],devices.get(i));List<String> messages=new ArrayList<>();for(int i=0;i<=batch;i++){String s=i==0?"You have a message.":"More mail "+(i+1)+".";messages.add(s);n.send("Taro",s);}
 for(int i=0;i<2;i++){check(registered.get(users[i]).contains(devices.get(i)));if(users[i].equals("Taro"))check(pending.get(devices.get(i)).equals(messages));else check(!pending.containsKey(devices.get(i)));}
 n.send("Unknown","not queued");check(!registered.containsKey("Unknown"));n.shutdown();check(!(Boolean)field(n,"active"));check(pending.isEmpty());if(retain){check(registered.keySet().equals(new HashSet<String>(Arrays.asList(users))));for(List<MobileDevice> list:registered.values())check(list.isEmpty());}else check(registered.isEmpty());
 n.send("Taro","You have 2 messages.");check(pending.isEmpty());for(List<MobileDevice> list:registered.values())check(list.isEmpty());System.out.println("{\"status\":\"pass\",\"assertions\":"+checks+"}");
 }
}