package pt.lsts.ripples.util;

public class HTTPResponse {

	private final String status;
	private final String message;
	
	public HTTPResponse(String status, String message) {
		this.status = status;
		this.message = message;
	}

	public String getStatus() {
		return status;
	}

	public String getMessage() {
		return message;
	}
	
	

}
