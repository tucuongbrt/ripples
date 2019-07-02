package pt.lsts.ripples.controllers.advices;

import pt.lsts.ripples.util.HTTPResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pt.lsts.ripples.exceptions.AssetNotFoundException;
import pt.lsts.ripples.exceptions.SendSoiCommandException;

@ControllerAdvice
@RequestMapping(produces = "application/json")
public class SoiControllerAdvice {


	@ResponseBody
	@ExceptionHandler(AssetNotFoundException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	HTTPResponse assetNotFoundExceptionHandler(AssetNotFoundException ex) {
	    return new HTTPResponse("error", ex.getMessage());
	}
	
	@ResponseBody
	@ExceptionHandler(SendSoiCommandException.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	HTTPResponse sendSoiCommandExceptionHandler(SendSoiCommandException ex) {
	    return new HTTPResponse("error", ex.getMessage());
	}

}
