package io.atlas;

import okhttp3.*;
import java.io.IOException;

public class AtlasClient {
    private final String baseUrl;
    private final String apiKey;
    private final OkHttpClient client = new OkHttpClient();

    public AtlasClient(String baseUrl, String apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    public String issueCredential(String jsonPayload) throws IOException {
        RequestBody body = RequestBody.create(jsonPayload, MediaType.get("application/json; charset=utf-8"));
        Request.Builder rb = new Request.Builder().url(baseUrl + "/v1/vrc/issue").post(body);
        if (apiKey != null) rb.header("Authorization", "Bearer " + apiKey);
        Response resp = client.newCall(rb.build()).execute();
        return resp.body().string();
    }
}
