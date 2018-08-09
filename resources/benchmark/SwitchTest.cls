public class SwitchTest {
    public static void test() {
        Integer i = 3;
        Object var_1_s = i;
        if(var_1_s == 0) {
            System.debug('0');
        } else {
            if(var_1_s == 1) {
            }
            if(var_1_s == 2) {
                System.debug('other');
            }
            return;
        }
    }
}