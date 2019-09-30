package pt.lsts.ripples.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pt.lsts.imc.IMCDefinition;
import pt.lsts.ripples.domain.assets.SystemAddress;
import pt.lsts.ripples.repo.main.AddressesRepository;

@Service
public class Resolver {

    @Autowired
    private AddressesRepository addresses;

    public int resolve(String name) {
        SystemAddress addr = addresses.findById(name).orElse(null);

        if (addr != null) {
            return addr.getImcId();
        }

        return IMCDefinition.getInstance().getResolver().resolve(name);
    }

    public String resolve(int id) {
        SystemAddress addr = addresses.findByImcId(id);
        if (addr != null)
            return addr.getName();

        return IMCDefinition.getInstance().getResolver().resolve(id);
    }

    public void update(int id, String name) {
        SystemAddress addr = addresses.findByImcId(id);
        if (addr == null) {
            addr = new SystemAddress(name);
            addr.setImcId(id);
        }

        addresses.save(addr);
    }
}
