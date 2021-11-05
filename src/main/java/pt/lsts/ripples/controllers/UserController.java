package pt.lsts.ripples.controllers;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import pt.lsts.ripples.domain.shared.AssetPosition;
import pt.lsts.ripples.domain.shared.UserLocation;
import pt.lsts.ripples.domain.maps.MapSettings;
import pt.lsts.ripples.domain.security.User;
import pt.lsts.ripples.exceptions.ResourceNotFoundException;
import pt.lsts.ripples.repo.main.PositionsRepository;
import pt.lsts.ripples.repo.main.UserLocationRepository;
import pt.lsts.ripples.repo.main.UserRepository;
import pt.lsts.ripples.security.CurrentUser;
import pt.lsts.ripples.security.UserPrincipal;
import pt.lsts.ripples.util.HTTPResponse;

@RestController
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserLocationRepository userLocationRepository;

    @Autowired
    private PositionsRepository positionsRepository;

    @Autowired
    private WebSocketsController wsController;

    private static Logger logger = LoggerFactory.getLogger(UserController.class);

    @GetMapping("/user/me")
    @PreAuthorize("hasRole('OPERATOR') or hasRole('SCIENTIST') or hasRole('ADMINISTRATOR') or hasRole('CASUAL')")
    public User getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
    }

    @GetMapping(path = { "/users/location/", "/users/location/" }, produces = "application/json")
    @PreAuthorize("hasRole('OPERATOR') or hasRole('SCIENTIST') or hasRole('ADMINISTRATOR')")
    public UserLocation getUserLastLocation(@CurrentUser UserPrincipal user) {
        Optional<UserLocation> opt = userLocationRepository.findByEmail(user.getEmail());
        if (opt.isPresent()) {
            return opt.get();
        }
        throw new ResourceNotFoundException("User location", "e-mail", user.getEmail());
    }

    @PostMapping(path = { "/users/location",
            "/users/location/" }, consumes = "application/json", produces = "application/json")
    @PreAuthorize("hasRole('OPERATOR') or hasRole('SCIENTIST') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<HTTPResponse> updateUserLocation(@CurrentUser UserPrincipal user,
            @RequestBody UserLocation location) {
        UserLocation newLocation;
        Optional<UserLocation> opt = userLocationRepository.findByEmail(user.getEmail());
        if (opt.isPresent()) {
            UserLocation currentLocation = opt.get();
            currentLocation.update(location);
            newLocation = userLocationRepository.save(currentLocation);
        } else {
            newLocation = userLocationRepository.save(location);
        }
        AssetPosition pos = positionsRepository.findByImcId(newLocation.getImcId());
        if (pos != null) {
            pos.update(location);
        } else {
            pos = new AssetPosition();
            pos.setImcId(newLocation.getImcId());
            pos.setLat(newLocation.getLatitude());
            pos.setLon(newLocation.getLongitude());
            pos.setName(newLocation.getName());
            pos.setTimestamp(newLocation.getTimestamp());
        }
        positionsRepository.save(pos);
        wsController.sendUserLocationUpdate(newLocation);
        return new ResponseEntity<>(
                new HTTPResponse("Success", "Location of user " + user.getEmail() + " updated to " + pos),
                HttpStatus.OK);
    }

    @GetMapping(path = { "/users/map/settings", "/users/map/settings/" }, produces = "application/json")
    @PreAuthorize("hasRole('OPERATOR') or hasRole('SCIENTIST') or hasRole('ADMINISTRATOR')")
    public MapSettings getUserMapSettings(@CurrentUser UserPrincipal user) {
        Optional<User> opt = userRepository.findByEmail(user.getEmail());
        if (opt.isPresent()) {
            User currentUser = opt.get();
            return currentUser.getMapSettings();
        }
        throw new ResourceNotFoundException("User", "e-mail", user.getEmail());
    }

    @PostMapping(path = { "/users/map/settings",
            "/users/map/settings/" }, consumes = "application/json", produces = "application/json")
    @PreAuthorize("hasRole('OPERATOR') or hasRole('SCIENTIST') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<HTTPResponse> updateUserMapSettings(@CurrentUser UserPrincipal user,
            @RequestBody MapSettings settings) {
        Optional<User> opt = userRepository.findByEmail(user.getEmail());
        if (opt.isPresent()) {
            User currentUser = opt.get();
            currentUser.setMapSettings(settings);
            userRepository.save(currentUser);
            return new ResponseEntity<>(
                    new HTTPResponse("Success", "Map settings of user " + user.getEmail() + " updated to " + settings),
                    HttpStatus.OK);
        }
        throw new ResourceNotFoundException("User", "e-mail", user.getEmail());
    }

    @GetMapping("/user/getUsers")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public List<User> listAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/user/getUser/{email}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('OPERATOR') or hasRole('SCIENTIST')")
    public User userInfo(@PathVariable String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            User userInfo = user.get();
            return userInfo;
        }
        return null;
    }

    @PostMapping("/user/changeUserRole")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<HTTPResponse> updateUserRole(@RequestBody Map<String, String> payload) {
        Optional<User> user = userRepository.findByEmail(payload.get("email"));
        if (user.isPresent()) {
            User newUserInfo = user.get();
            newUserInfo.setRole(payload.get("role"));
            userRepository.save(newUserInfo);
            return new ResponseEntity<>(new HTTPResponse("Success", "Changed user role"), HttpStatus.OK);
        }
        return new ResponseEntity<>(new HTTPResponse("Error", "Cannot change user role"), HttpStatus.NOT_FOUND);
    }

    @PostMapping("/user/changeUserDomain/{email}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<HTTPResponse> updateUserDomain(@PathVariable String email, @RequestBody String[] payload) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            List<String> domain = new ArrayList<>(Arrays.asList(payload));
            User newUserInfo = user.get();
            newUserInfo.setDomain(domain);
            userRepository.save(newUserInfo);
            return new ResponseEntity<>(new HTTPResponse("Success", "Updated user domain"), HttpStatus.OK);
        }
        return new ResponseEntity<>(new HTTPResponse("Error", "Cannot update user domain"), HttpStatus.NOT_FOUND);
    }

    @PostMapping("/user/removeUser/{email}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<HTTPResponse> removeUser(@PathVariable String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            User userToRemove = user.get();
            userRepository.delete(userToRemove);
            logger.info("Removed user: " + email);
            return new ResponseEntity<>(new HTTPResponse("Success", "User removed"), HttpStatus.OK);
        }
        return new ResponseEntity<>(new HTTPResponse("Error", "User cannot be removed"), HttpStatus.OK);
    }

    @PostMapping("/user/image/upload")
    public ResponseEntity<HTTPResponse> updateUserImage(@RequestParam("image") MultipartFile file,
            @RequestParam String baseUrl, @RequestParam String email) throws IOException {

        String currentPath = System.getProperty("user.dir");
        String directoryPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1).concat("userImages");
        String fileName = System.currentTimeMillis() + "." + FilenameUtils.getExtension(file.getOriginalFilename());
        String filePath = directoryPath + "/" + fileName;
        String imageUrl = baseUrl + "/user/image/" + fileName;

        System.out.println("FilePath: " + filePath);
        System.out.println("ImageUrl: " + imageUrl);

        File directory = new File(directoryPath);
        if (!directory.exists()) {
            directory.mkdir();
            logger.info("Created user images directory: " + directoryPath);
        }

        File imageFile = new File(filePath);
        if (!imageFile.exists()) {
            Optional<User> user = userRepository.findByEmail(email);
            if (user.isPresent()) {
                imageFile.createNewFile();
                FileOutputStream fout = new FileOutputStream(imageFile);
                fout.write(file.getBytes());
                fout.close();

                User newUserInfo = user.get();
                newUserInfo.setImageUrl(imageUrl);
                userRepository.save(newUserInfo);

                logger.info("Added user image");
                return new ResponseEntity<>(new HTTPResponse("Success", "User image uploaded"), HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(new HTTPResponse("Error", "Cannot upload user image"), HttpStatus.OK);
    }

    @GetMapping("/user/image/{fileName}")
    public void userImage(@PathVariable String fileName, HttpServletResponse response) {
        String currentPath = System.getProperty("user.dir");
        String imagePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1).concat("userImages/")
                .concat(fileName);

        response.setContentType("image/" + FilenameUtils.getExtension(fileName));
        response.setHeader("Content-Disposition", "attachment; filename=" + fileName);
        response.setHeader("Content-Transfer-Encoding", "binary");

        try {
            BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream());
            FileInputStream fis = new FileInputStream(imagePath);
            int len;
            byte[] buf = new byte[1024];
            while ((len = fis.read(buf)) > 0) {
                bos.write(buf, 0, len);
            }
            fis.close();
            bos.close();
            response.flushBuffer();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}