package pt.lsts.ripples.tests;

import okhttp3.MediaType;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import pt.lsts.ripples.domain.assets.Plan;
import retrofit2.Call;
import retrofit2.Response;
import retrofit2.Retrofit;

import java.io.IOException;

public class RockBlockTest {

    public static final String TIME = "19-02-19 15:00:00";

    public static Retrofit retrofit = new Retrofit.Builder()
            .baseUrl("http://localhost:9090/")
            .build();

    public static RockBlockService service = retrofit.create(RockBlockService.class);

    private static final String UNKNOWN_PLAIN_TEXT = "556E6B6E6F776E20666F726D6174206D657373616765";
    private static final String PLAIN_TEXT_MSG = "28522920286c6175762d78706c6f72652d31292031343a34393a3536202f20343120332e3339313930312c202d382034312e393835323231202f20663a2d3120763a32363220633a2d31202f20733a204d202f20703a2d31";


    private static final String IMC1 = "1e00ffffda07540317c66a5c02050000ffff0000";
    private static final String IMC2 = "1e00ffffda07540326c66a5c020100005303286402005203e639244235320bc14dc66a5c3c005203ae3824429f360bc129c76a5c3c000000";
    private static final String IMC3 = "1e00ffffd5071e00494e464f3a2046696e697368656420706c616e20657865637574696f6e2e";
    private static final String IMC4 = "1e00ffffda07020256c66a5c56c66a5ce03924422a320bc1ffffffff7ef0090021ff2864";

    public static void testIridium(String message) {
        RequestBody requestBody = RequestBody.create(MediaType.parse("application/hub"), message);
        Call<ResponseBody> call = service.postIridium(requestBody);
        executeCall(call);
    }

    public static void testRock7(String data){
        Call<ResponseBody> call = service.postRock7("+351964085112", TIME, data);
        executeCall(call);
    }

    private static void executeCall(Call<ResponseBody> call) {
        try {
            Response<ResponseBody> response = call.execute();
            System.out.println("Call executed");
            if (response.isSuccessful()) {
                String strResponseBody = response.body().string();
                System.out.println("Response: " + strResponseBody);
            } else {
                System.out.println("Some error occurred:" + response.toString());
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void testIridiumWrapper(){
        testIridium(PLAIN_TEXT_MSG);
        testIridium(IMC1);
        testIridium(IMC2);
        testIridium(IMC3);
        testIridium(IMC4);
    }

    private static void testRock7Wrapper(){
        testRock7("");
        testRock7(UNKNOWN_PLAIN_TEXT);
        testRock7(PLAIN_TEXT_MSG);
        testRock7(IMC1);
        testRock7(IMC2);
        testRock7(IMC3);
        testRock7(IMC4);
    }

    public static void main(String args[]){
        testIridiumWrapper();
        testRock7Wrapper();
    }
}
