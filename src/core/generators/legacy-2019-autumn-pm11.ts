import{code,field,p,strings,type GenerationDefinition}from'./definition';import{autumnJavaReference}from'./legacy-2019-autumn-java-reference';
export const autumnNotifierSource='2019r01a-fe-pm-11';
export function autumnNotifierModel(values:number[]){if(values.length!==3||values.some((v,i)=>!Number.isInteger(v)||v<0||v>[1,3,2][i]))throw Error('PARAMETER_CONSTRAINT');const[retainCase,batchCase,mappingCase]=values,users=[['Taro','Taro'],['Taro','Jiro'],['Jiro','Taro']][mappingCase],messages=Array.from({length:batchCase+1},(_,i)=>i===0?'You have a message.':`More mail ${i+1}.`);return{retain:retainCase===1,users,messages,postAnswer:retainCase===0?4:5};}
export function autumnNotifierPrograms(values:number[]){const m=autumnNotifierModel(values);return[
`import java.util.List;
public interface NotificationListener {
    void onNotificationReceived(List<String> messageList);
}`,
`public final class MobileDevice {
    private final String name;
    private final NotificationListener listener;
    public MobileDevice(String name, NotificationListener listener) {
        this.name = name;
        this.listener = listener;
    }
    public NotificationListener getListener() { return listener; }
    public String getName() { return name; }
}`,
`import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
public final class Notifier {
    private static final Notifier INSTANCE = new Notifier();
    private final Object lock = new Object();
    // 利用者ごとに携帯端末を管理
    private final Map<String, List<MobileDevice>> userMobileDevices = new HashMap<>();
    // 携帯端末ごとに通知メッセージを保持
    private final Map<MobileDevice, List<String>> messagesToDeliver = new HashMap<>();
    private volatile boolean active = true;
    public static Notifier getInstance() { return [a]; }
    private Notifier() { }
    public void register(String user, MobileDevice device) {
        synchronized (lock) {
            List<MobileDevice> devices = userMobileDevices.get(user);
            if (devices == null) {
                devices = new ArrayList<>();
                userMobileDevices.put([b]);
            }
            devices.add(device);
        }
    }
    public void send(String user, String message) {
        List<MobileDevice> devices = new ArrayList<>();
        synchronized (lock) {
            if (userMobileDevices.containsKey(user)) {
                for (MobileDevice device : userMobileDevices.get(user)) {
                    List<String> messageList = messagesToDeliver.get(device);
                    if (messageList == null) {
                        messageList = new ArrayList<>();
                        messagesToDeliver.put([c]);
                    }
                    messageList.add(message);
                    devices.add(device);
                }
            }
        }
        for (MobileDevice device : devices) {
            synchronized (device) {
                // 通知メッセージがあることを待ち受け状態のスレッドに通知
                device.notifyAll();
            }
        }
    }
    public void loopForMessages(MobileDevice device) {
        while (active) {
            List<String> messageList;
            synchronized (lock) { messageList = messagesToDeliver.remove(device); }
            if (messageList != null) {
                device.getListener().onNotificationReceived(messageList);
            }
            synchronized (device) {
                try {
                    // 通知メッセージが到着するかタイムアウトするまで待つ
                    device.wait(3000L);
                }
                catch (InterruptedException e) { break; }
            }
        }
    }
    public void shutdown() {
        active = false;
        List<MobileDevice> devices = new ArrayList<>();
        synchronized (lock) {
            messagesToDeliver.clear();
            for (String user : userMobileDevices.keySet()) {
                for (MobileDevice device : userMobileDevices.get(user)) {
                    devices.add(device);
                }
            }
            ${m.retain?'for (String user : userMobileDevices.keySet()) {\n                userMobileDevices.get(user).clear();\n            }':'userMobileDevices.clear();'}
        }
        for (MobileDevice device : devices) {
            synchronized (device) {
                // 待ち受け状態のスレッドに通知
                device.notifyAll();
            }
        }
    }
}`,
`public class Tester {
    public static void main(String[] args) [d] InterruptedException {
        createUserMobileDevice("${m.users[0]}", "phone");
        createUserMobileDevice("${m.users[1]}", "tablet");
        Notifier notifier = Notifier.getInstance();
${m.messages.map(message=>'        notifier.send("Taro", "'+message+'");').join('\n')}
        Thread.sleep(500L);
        notifier.shutdown();
        /* α */
    }
    private static void createUserMobileDevice(String user, String name) {
        MobileDevice device = new MobileDevice(name, messageList ->
            System.out.println([e] + ": " + messageList));
        Notifier notifier = Notifier.getInstance();
        notifier.register(user, device);
        new Thread(() -> {
            notifier.loopForMessages(device);
            System.out.printf("Terminating %s's %s%n", user, name);
        }).start();
    }
}`];}
export const legacy2019AutumnNotifierDefinitions:GenerationDefinition[]=[{source:autumnNotifierSource,title:'旧制度・午後：Javaの非同期通知とスレッド同期',version:'3.2.0',fields:[field('shutdownRegistryCase',0,1),field('notificationBatchCase',0,3),field('userDeviceMappingCase',0,2)],reference:[0,0,0],sourceAnswer:'設問1 aイ bオ cイ dオ eウ／設問2 オ',notes:'原57〜63の4プログラム/実行例/α置換2行/6欄と各6択、b/c共有bank、singleton・Map lock/device monitor・volatile・notifyAll・wait3000・InterruptedException・sleep500とスケジュール差前提を保持。原API付録を独立動作資料へ原側も差替える改変候補。停止時に利用者登録も消す元条件と、利用者キーを保持し端末リストだけ空にする独自条件の2条件、通知バッチ1〜4、端末と利用者の対応3条件で24条件。停止後sendの正答は未登録/登録済端末なしに変わる。全プログラム・説明・例を同じ入力から作り、正答を動かすための名称置換だけにしない。',build:values=>{const m=autumnNotifierModel(values),programs=autumnNotifierPrograms(values),example=[...['phone','tablet'].flatMap((device,i)=>m.users[i]==='Taro'?[device+': ['+m.messages.join(', ')+']']:[]),...['tablet','phone'].map((name,i)=>`Terminating ${m.users[1-i]}'s ${name}`)].join('\n'),bankA=['getInstance()','INSTANCE','new Notifier()','Notifier()','Notifier.class','this'],bankBC=['device, devices','device, messageList','device, user','user, device','user, devices','user, messageList'],bankD=['extends','implements','requires','throw','throws','uses'],bankE=['device','device.getName()','name','Tester.this.name','this.name','user'],post=['“phone: [You have 2 messages.]”だけを出力する。','“tablet: [You have 2 messages.]”だけを出力する。','メソッドloopForMessagesでNullPointerExceptionが発生する。','メソッドsendでNullPointerExceptionが発生する。','利用者名Taroが登録されていないので、メソッドsendは何もしないで終了する。','利用者名Taroは登録されているが、その利用者の携帯端末が何も登録されていないので、メソッドsendは何もしないで終了する。'],banks=[bankA,bankBC,bankD,bankE,post],offsets=[0,6,6,12,18,24];
 return{prompt:[p('問11 次のJavaプログラムの説明及びプログラムを読んで、設問1、2に答えよ。使用するAPIはこの問題の独立編集参照資料を参照できる。'),p('メール着信の通知メッセージを携帯端末へ非同期に配信するシステムを模す。通知の配信処理と各端末の処理はそれぞれ独立したスレッドで実行する。各コンストラクタとメソッドには正しい引数を与える。NotificationListenerは通知を受信するonNotificationReceivedをもち、引数は文字列のリストである。MobileDeviceは端末名とリスナを保持し、各getterで返す。'),p('NotifierはJava仮想マシン内で唯一のインスタンスである。registerは利用者と端末を登録し、同じ利用者への端末は追加する。sendは指定利用者の各端末へ通知を用意し、未配信メッセージがあればそのリストへ追加する。loopForMessagesは通知があればリスナへ渡し、なければ待ち受ける。この処理を通知システムの停止まで繰り返す。'),p(m.retain?'この改変条件でのshutdownは、通知システムを停止し、全未配信メッセージと全端末の登録を削除するが、利用者名の登録自体は空の端末リストと共に保持する。登録されていた全端末の待ち受け状態を解除する。':'shutdownは通知システムを停止し、全未配信メッセージ・全利用者名と端末の登録情報を削除する。登録されていた全端末の待ち受け状態を解除する。'),p('Testerのmainは端末を登録してTaroへ通知を送り、その後停止する。createUserMobileDeviceは利用者名と端末名を登録して、通知を受ける処理を新しいスレッドで実行する。プログラムの実行速度及び事象発生への応答が十分速いものとする。図1は出力の一例であり、スレッドのスケジューリングによって出力順は異なることがある。'),code(example,'text'),p('図1 mainの実行結果の例（メッセージが同じリストにまとまった場合）。'),...programs.flatMap((s,i)=>[p('プログラム'+(i+1)),code(s,'java')]),p('設問1 プログラム中a〜eに入れる正しい答えを各解答群から選べ。bとcは共通の解答群を使う。'),p('設問2 mainの/* α */を図2の2行に置き換えたとき、この2行に対する動作として正しい記述を一つ選べ。'),code('notifier.send("Taro", "You have 2 messages.");\nThread.sleep(500L);','java'),p('図2 αと置き換える2行。'),...autumnJavaReference()],choices:banks.flatMap(strings),answerParts:Array.from({length:6},(_,i)=>({id:i<5?'part-'+'abcde'[i]:'part-sub2',label:i<5?'設問1 '+'abcde'[i]:'設問2',choiceIds:Array.from({length:6},(_,j)=>'choice-value-'+(offsets[i]+j+1))})),partAnswers:[1,4,1,4,2,m.postAnswer].map((v,i)=>({kind:'choice'as const,partId:i<5?'part-'+'abcde'[i]:'part-sub2',choiceId:'choice-value-'+(offsets[i]+v+1)})),explanation:`aは唯一のインスタンスINSTANCE。bはuserにdevicesを、cはdeviceにmessageListを対応させる。dは検査例外を宣言するthrows。eはlambdaから参照する端末名の引数nameである。shutdown後はactive=falseであり、${m.retain?'利用者Taroのキーは残るが端末リストが空なので、send内のforは一度も実行しない。':'利用者Taroのキー自体が消えるので、containsKeyはfalseとなる。'}したがって追加した2行のsendによる出力やNullPointerExceptionは発生しない。`};}}];
