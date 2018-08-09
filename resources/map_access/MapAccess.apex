public class MapAccess {
    public static void main() {
        Map<String, Integer> count = new Map<String, Integer>{ 'a' => 2 };
        Integer i = count['a'];
        ++count['a'];
        count['a']++;
        count['a'] += 2;

        List<Integer> nums = new List<Integer>{ 2 };
        Integer j = nums[0];
        ++nums[0];
        nums[0]++;
        nums[0] += 2;
    }
}
