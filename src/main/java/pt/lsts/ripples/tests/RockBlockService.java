package pt.lsts.ripples.tests;

import okhttp3.ResponseBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.POST;

public interface RockBlockService {

    @FormUrlEncoded
    @POST("rock7")
    Call<ResponseBody> postRock7(@Field("imei") String imei,
                                 @Field("transmit_time") String transmit_time,
                                 @Field("data") String data);

    @POST("api/v1/iridium")
    Call<ResponseBody> postIridium(@Body RequestBody body);
}
