public class DestructureDemo {
    public static void main() {
        List<String> names = new List<String>{ 'Wilson', 'Adam' };
        List<Object> destructure_1 = (List<Object>)names;
        String p1 = (String)destructure_1.get(0);
        String p2 = (String)destructure_1.get(1);

        Map<String, Object> infos = new Map<String, Object>{ 'a' => 1, 'b' => '2' };
        Map<String, Object> destructure_6 = (Map<String, Object>)infos;
        Integer count = (Integer)destructure_6.get('a');
        String id = (String)destructure_6.get('b');

        Account ac = new Account(Name = 'test acc');
        SObject destructure_11 = (SObject)ac;
        String name = (String)destructure_11.get('Name');

        List<Integer> numbers = new List<Integer>{ 1, 2, 3, 4, 5 };
        List<Object> destructure_15 = (List<Object>)numbers;
        Integer first = (Integer)destructure_15.get(0);
        List<Object> destructure_17 = (List<Object>)numbers;
        Integer last = (Integer)destructure_17.get(destructure_17.size() - 1);

        List<String> signs = new List<String>{  };
        List<Object> destructure_21 = (List<Object>)signs;
        String sign = (String)Sweet.defaultIfNull(destructure_21.get(0), 'stop');
    }
}